import { Metadata } from 'next';
import CompanyOrders from '@/components/company/orders/CompanyOrders';

export const metadata: Metadata = {
    title: 'إدارة طلبات الشركة | شحنتك',
    description: 'سجل وإدارة طلبات الشحن وتجميع الطلبات وتتبع العمليات لبوابة الشركة',
};

export default function CompanyOrdersPage() {
    return (
        <main className="bg-surface-muted">
            <CompanyOrders />
        </main>
    );
}
