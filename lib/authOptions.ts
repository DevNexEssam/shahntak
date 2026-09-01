/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import CompanyUser from "@/models/Companyuser";
import Company from "@/models/companies";

export const authOptions: NextAuthOptions = {
    providers: [
        // 1. ADMIN / SUPER ADMIN (صحاب المنصة)
        CredentialsProvider({
            id: "admin-credentials",
            name: "Admin Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await connectDB();
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
                }

                const email = credentials.email.trim().toLowerCase();
                const user = await User.findOne({
                    email,
                    deletedAt: null,
                }).select("+password");

                if (!user) {
                    throw new Error("لا يوجد حساب مدير مسجل بهذا البريد الإلكتروني");
                }

                if (user.status !== "active") {
                    throw new Error("حسابك غير نشط أو معطل، يرجى التواصل مع إدارة النظام");
                }

                const isCorrect = await bcrypt.compare(credentials.password, user.password);
                if (!isCorrect) {
                    throw new Error("بيانات تسجيل الدخول غير صحيحة");
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role, // "super" | "admin"
                    image: (user as any).avatar || (user as any).image || null,
                };
            },
        }),

        // 2. COMPANY MASTER ACCOUNT (حساب الشركة الرئيسي)
        CredentialsProvider({
            id: "company-credentials",
            name: "Company Master Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await connectDB();
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
                }

                const email = credentials.email.trim().toLowerCase();
                const company = await Company.findOne({
                    email,
                    deletedAt: null,
                }).select("+password");

                if (!company) {
                    throw new Error("لا يوجد حساب شركة مسجل بهذا البريد الإلكتروني");
                }

                if (company.status !== "active") {
                    const statusMessages: Record<string, string> = {
                        inactive: "حساب الشركة غير نشط، يرجى التواصل مع إدارة النظام",
                        archived: "تم أرشفة حساب هذه الشركة",
                        banned: "تم حظر حساب الشركة لمخالفة الشروط والأحكام",
                    };
                    throw new Error(statusMessages[company.status] || "حساب الشركة غير متاح حالياً");
                }

                const isCorrect = await bcrypt.compare(credentials.password, company.password);
                if (!isCorrect) {
                    throw new Error("بيانات تسجيل الدخول غير صحيحة");
                }

                return {
                    id: company._id.toString(),
                    name: company.companyName,
                    email: company.email,
                    role: company.role || "company", // "company"
                    companyId: company._id.toString(),
                    image: (company as any).avatar || (company as any).image || null,
                };
            },
        }),

        // 3. COMPANY EMPLOYEES
        CredentialsProvider({
            id: "employee-credentials",
            name: "Company Employee Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await connectDB();
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
                }

                const email = credentials.email.trim().toLowerCase();
                const companyUser = await CompanyUser.findOne({
                    userEmail: email,
                    deletedAt: null,
                }).select("+password");

                if (!companyUser) {
                    throw new Error("لا يوجد حساب موظف مسجل بهذا البريد الإلكتروني");
                }

                if (companyUser.status !== "active" || companyUser.userIsActive === false) {
                    throw new Error("حساب الموظف معطل، يرجى مراجعة إدارة الشركة");
                }

                const parentCompany = await Company.findOne({
                    _id: companyUser.companyId,
                    deletedAt: null,
                });

                if (!parentCompany || parentCompany.status !== "active") {
                    throw new Error("الشركة التابع لها هذا الحساب معطلة أو غير نشطة");
                }

                const isCorrect = await bcrypt.compare(credentials.password, companyUser.password);
                if (!isCorrect) {
                    throw new Error("بيانات تسجيل الدخول غير صحيحة");
                }

                return {
                    id: companyUser._id.toString(),
                    name: companyUser.userName,
                    email: companyUser.userEmail,
                    role: companyUser.userRole, // "owner" | "manager" | "staff"
                    companyId: companyUser.companyId.toString(),
                    image: (companyUser as any).avatar || (companyUser as any).image || null,
                };
            },
        }),
    ],

    pages: {
        signIn: "/login",
    },

    session: {
        strategy: "jwt",
    },

    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.companyId = (user as any).companyId ?? null;
                token.image = (user as any).image ?? null;
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = (token.id as string) || token.sub;
                session.user.role = token.role as any;
                session.user.companyId = token.companyId as any;
                session.user.image = (token.image as string) ?? null;
            }
            return session;
        },
    },
};