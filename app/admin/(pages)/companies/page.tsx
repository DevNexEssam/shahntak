import Companies from "@/components/admin/companies/Companies";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "إدارة الشركات المسجلة | شحنتك",
    description: "لوحة تحكم إدارة وشركات الشحن المشتركة والأساطيل في منصة شحنتك اللوجستية.",
};

export default function CompaniesPage() {
    return <Companies />;
}