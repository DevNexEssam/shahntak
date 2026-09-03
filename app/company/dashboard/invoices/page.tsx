import { Metadata } from 'next';
import CompanyInvoices from '@/components/company/invoices/CompanyInvoices';

export const metadata: Metadata = {
    title: 'البوالص والفواتير المالية | شحنتك',
    description: 'عرض وتتبع الفواتير اللوجستية والتحصيلات والمبالغ المتبقية لبوابة الشركة',
};

export default function CompanyInvoicesPage() {
    return (
        <main className="bg-surface-muted">
            <CompanyInvoices />
        </main>
    );
}
