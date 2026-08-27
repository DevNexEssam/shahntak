import { Metadata } from 'next';
import Payments from '@/components/admin/payments/Payments';

export const metadata: Metadata = {
    title: 'سداد المدفوعات والمعاملات المالية | شحنتك',
    description: 'إدارة وتتبع عمليات سداد الفواتير والتحويلات المالية المحصلة بالمنصة',
};

export default function PaymentsPage() {
    return (
        <main className="bg-surface-muted">
            <Payments />
        </main>
    );
}
