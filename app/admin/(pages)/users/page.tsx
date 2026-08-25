import Users from "@/components/admin/users/Users";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "إدارة المستخدمين والمدراء | شحنتك",
    description: "إدارة فريق عمل ومدراء منصة شحنتك وتعيين الصلاحيات وحالات الحسابات.",
};

export default function UsersPage() {
    return (
        <main className="bg-surface-muted">
            <Users />
        </main>
    );
}
