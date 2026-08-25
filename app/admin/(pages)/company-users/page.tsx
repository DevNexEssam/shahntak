import { Metadata } from 'next';
import CompanyUsers from '@/components/admin/company-users/CompanyUsers';

export const metadata: Metadata = {
    title: 'إدارة موظفي الشركات والصلاحيات | شحنتك',
    description: 'إدارة وتتبع موظفي الشركات والشركاء اللوجستيين وتحديد الأدوار والصلاحيات بالمنصة',
};

export default function CompanyUsersPage() {
    return (
        <main className="min-h-screen bg-surface-muted p-4 md:p-8 font-arabic" dir="rtl">
            <CompanyUsers />
        </main>
    );
}
