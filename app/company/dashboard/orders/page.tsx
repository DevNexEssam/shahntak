import { Metadata } from 'next';
import { Suspense } from 'react';
import CompanyOrders from '@/components/company/orders/CompanyOrders';
import Loading from '@/components/ui/loading';

export const metadata: Metadata = {
    title: 'إدارة طلبات الشركة | شحنتك',
    description: 'سجل وإدارة طلبات الشحن وتجميع الطلبات وتتبع العمليات لبوابة الشركة',
};

export default function CompanyOrdersPage() {
    return (
        <main className="bg-surface-muted">
            <Suspense fallback={<Loading />}>
                <CompanyOrders />
            </Suspense>
        </main>
    );
}

