import { Metadata } from 'next';
import CompanyDashboard from '@/components/company/dashboard/CompanyDashboard';

export const metadata: Metadata = {
    title: 'مركز العمليات الرئيسي | شحنتك',
    description: 'لوحة التحكم والعمليات اللوجستية المباشرة لبوابة الشركة',
};

export default function DashboardPage() {
    return (
        <main className="bg-surface-muted min-h-screen">
            <CompanyDashboard />
        </main>
    );
}