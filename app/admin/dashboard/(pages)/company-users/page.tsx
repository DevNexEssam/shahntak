import { Metadata } from 'next';
import CompanyUsers from '@/components/admin/company-users/CompanyUsers';

export const metadata: Metadata = {
    title: 'إدارة موظفي الشركات والصلاحيات | شحنتك',
    description: 'إدارة وتتبع موظفي الشركات والشركاء اللوجستيين وتحديد الأدوار والصلاحيات بالمنصة',
};

export default function CompanyUsersPage() {
    return (
        <main className="bg-surface-muted">
            <CompanyUsers />
        </main>
    );
}
