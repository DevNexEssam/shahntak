import { Metadata } from 'next';
import CompanyEmployees from '@/components/company/employees/CompanyEmployees';

export const metadata: Metadata = {
    title: 'فريق العمل والموظفين | شحنتك',
    description: 'إدارة فريق العمل، حسابات الموظفين، الأدوار والصلاحيات لبوابة الشركة',
};

export default function CompanyEmployeesPage() {
    return (
        <main className="bg-surface-muted">
            <CompanyEmployees />
        </main>
    );
}
