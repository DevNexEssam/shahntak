import { Metadata } from 'next';
import Orders from '@/components/admin/orders/Orders';

export const metadata: Metadata = {
    title: 'إدارة الطلبات والشحنات | شحنتك',
    description: 'سجل الطلبات والشحنات اللوجستية وتجميع الطلبات وتتبع العمليات بالمنصة',
};

export default function OrdersPage() {
    return (
        <main className="min-h-screen bg-surface-muted p-4 md:p-8 font-arabic" dir="rtl">
            <Orders />
        </main>
    );
}