import { Metadata } from 'next';
import Invoices from '@/components/admin/invoices/Invoices';

export const metadata: Metadata = {
    title: 'البوالص والفواتير المالية | شحنتك',
    description: 'متابعة فواتير الاشتراكات والخدمات اللوجستية ورسوم البوالص والتحصيل المالي',
};

export default function InvoicesPage() {
    return (
        <main className="min-h-screen bg-surface-muted p-4 md:p-8 font-arabic" dir="rtl">
            <Invoices />
        </main>
    );
}