/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
// import User from "@/models/admin";
// import Clinic from "@/models/clinic";
// import Doctor from "@/models/doctor";
// import Employee from "@/models/employee";
// import Patient from "@/models/patient";

export const authOptions: NextAuthOptions = {
    providers: [
        // PATIENT
        // CredentialsProvider({
        //     id: "patient-credentials",
        //     name: "Patient Credentials",
        //     credentials: {
        //         phoneOrEmail: { label: "Phone or Email", type: "text" },
        //         password: { label: "Password", type: "password" },
        //     },
        //     async authorize(credentials) {
        //         await connectDB();
        //         if (!credentials?.phoneOrEmail || !credentials.password)
        //             throw new Error("يرجى إدخال رقم الهاتف/البريد وكلمة المرور");

        //         const identifier = credentials.phoneOrEmail.trim().toLowerCase();

        //         const patient = await Patient.findOne({
        //             $or: [{ phone: identifier }, { email: identifier }],
        //         }).select("+password");

        //         if (!patient) throw new Error("لم يتم العثور على حساب مريض بهذه البيانات");
        //         if (patient.status === "inactive")
        //             throw new Error("حسابك غير نشط. يرجى التواصل مع الدعم الفني.");
        //         if (!patient.password)
        //             throw new Error("هذا الحساب غير مفعل للدخول أونلاين. يرجى إنشاء كلمة مرور.");

        //         const isCorrect = await bcrypt.compare(credentials.password, patient.password);
        //         if (!isCorrect) throw new Error("كلمة المرور غير صحيحة");

        //         return {
        //             id: patient._id.toString(),
        //             name: patient.name,
        //             email: patient.email || "",
        //             role: "patient",
        //         };
        //     },
        // }),

        // ADMIN
        CredentialsProvider({
            id: "admin-credentials",
            name: "User Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await connectDB();
                if (!credentials?.email || !credentials.password)
                    throw new Error("يرجى ادخال البريد الإلكتروني وكلمة المرور");

                const user = await User.findOne({
                    email: credentials.email.toLowerCase(),
                }).select("+password");
                if (!user) throw new Error("لا يوجد مستخدم بهذا الحساب");
                if (user.status === "inactive")
                    throw new Error("حسابك غير نشط، يرجى التواصل مع الدعم الفني");

                const isCorrect = await bcrypt.compare(credentials.password, user.password);
                if (!isCorrect) throw new Error("كلمة المرور غير صحيحة");

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),

        // CLINIC
        // CredentialsProvider({
        //     id: "clinic-credentials",
        //     name: "Clinic Credentials",
        //     credentials: {
        //         email: { label: "Email", type: "text" },
        //         password: { label: "Password", type: "password" },
        //     },
        //     async authorize(credentials) {
        //         await connectDB();
        //         const clinic = await Clinic.findOne({ email: credentials?.email.toLowerCase() }).select("+password");
        //         if (!clinic) throw new Error("Clinic not found");
        //         if (clinic.status === "inactive")
        //             throw new Error("Your account is inactive. Please contact support");

        //         const isCorrect = await bcrypt.compare(credentials!.password, clinic.password);
        //         if (!isCorrect) throw new Error("Invalid credentials");

        //         return {
        //             id: clinic._id.toString(),
        //             clinicId: clinic._id.toString(),
        //             name: clinic.name,
        //             email: clinic.email,
        //             role: "clinic",
        //             logo: clinic.logo || null,
        //         };
        //     },
        // }),

        // DOCTOR
        // CredentialsProvider({
        //     id: "doctor-credentials",
        //     name: "Doctor Credentials",
        //     credentials: {
        //         email: { label: "Email", type: "text" },
        //         password: { label: "Password", type: "password" },
        //     },
        //     async authorize(credentials) {
        //         await connectDB();
        //         const doctor = await Doctor.findOne({ email: credentials?.email.toLowerCase() }).select("+password");
        //         if (!doctor) throw new Error("Doctor not found");
        //         if (doctor.status === "inactive")
        //             throw new Error("Your account is inactive. Please contact support");

        //         const isCorrect = await bcrypt.compare(credentials!.password, doctor.password);
        //         if (!isCorrect) throw new Error("Invalid credentials");

        //         return {
        //             id: doctor._id.toString(),
        //             doctorId: doctor._id.toString(),
        //             name: doctor.name,
        //             email: doctor.email,
        //             role: "doctor",
        //             image: doctor.image || null,
        //         };
        //     },
        // }),

        // EMPLOYEE
        // CredentialsProvider({
        //     id: "employee-credentials",
        //     name: "Employee Credentials",
        //     credentials: {
        //         email: { label: "Email", type: "text" },
        //         password: { label: "Password", type: "password" },
        //     },
        //     async authorize(credentials) {
        //         await connectDB();
        //         const employee = await Employee.findOne({ email: credentials?.email.toLowerCase() }).select("+password");
        //         if (!employee) throw new Error("Employee not found");
        //         if (employee.status === "inactive")
        //             throw new Error("Your account is inactive. Please contact support");

        //         if (employee.role === "worker")
        //             throw new Error("عذراً، هذا الحساب غير مصرح له بتسجيل الدخول للنظام.");

        //         const isCorrect = await bcrypt.compare(credentials!.password, employee.password);
        //         if (!isCorrect) throw new Error("Invalid credentials");

        //         return {
        //             id: employee._id.toString(),
        //             clinicId: employee.clinic.toString(),
        //             branchId: employee.branch.toString(),
        //             name: employee.name,
        //             email: employee.email,
        //             role: employee.role, // reception or manager
        //         };
        //     },
        // }),

        // IMPERSONATION
        // CredentialsProvider({
        //     id: "impersonate",
        //     name: "Impersonate",
        //     credentials: {
        //         targetUserId: { label: "User ID", type: "text" },
        //         targetRole: { label: "Role", type: "text" },
        //         adminId: { label: "User ID", type: "text" },
        //     },
        //     async authorize(credentials) {
        //         await connectDB();

        //         if (!credentials) throw new Error("Missing credentials");

        //         // Type assertion
        //         const { targetUserId, targetRole, adminId } = credentials as {
        //             targetUserId: string;
        //             targetRole: "clinic" | "doctor";
        //             adminId: string;
        //         };

        //         if (!targetUserId || !targetRole || !adminId)
        //             throw new Error("Missing impersonation data");

        //         let target: any;

        //         if (targetRole === "clinic") {
        //             target = await Clinic.findById(targetUserId);
        //             if (!target) throw new Error("Clinic not found");

        //             return {
        //                 id: target._id.toString(),
        //                 clinicId: target._id.toString(),
        //                 name: target.name,
        //                 email: target.email,
        //                 role: "clinic",
        //                 logo: target.logo || null,
        //                 impersonatedBy: { id: adminId, role: "admin" },
        //             };
        //         } else if (targetRole === "doctor") {
        //             target = await Doctor.findById(targetUserId);
        //             if (!target) throw new Error("Doctor not found");

        //             return {
        //                 id: target._id.toString(),
        //                 doctorId: target._id.toString(),
        //                 name: target.name,
        //                 email: target.email,
        //                 role: "doctor",
        //                 image: target.image || null,
        //                 impersonatedBy: { id: adminId, role: "admin" },
        //             };
        //         } else {
        //             throw new Error("Invalid target role");
        //         }
        //     },
        // }),

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
                token.role = (user as any).role;
                token.clinicId = (user as any).clinicId;
                token.branchId = (user as any).branchId;
                token.doctorId = (user as any).doctorId;
                token.logo = (user as any).logo;
                token.image = (user as any).image;
                token.impersonatedBy = (user as any).impersonatedBy ?? null;
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as
                    | "admin"
                    | "super"
                    | "clinic"
                    | "doctor"
                    | "reception"
                    | "manager"
                    | "worker"
                    | "patient"
                    | undefined;

                // session.user.clinicId = token.clinicId;
                // session.user.branchId = token.branchId;
                // session.user.doctorId = token.doctorId;
                session.user.logo = token.logo ?? null;
                session.user.image = token.image ?? null;
                session.user.impersonatedBy = token.impersonatedBy ?? null;
                session.user.id = token.sub; // Inject the user's ID into the session
            }
            return session;
        },
    },
};

