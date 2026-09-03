import { Metadata } from 'next';
import CompanyShipments from '@/components/company/shipments/CompanyShipments';

export const metadata: Metadata = {
    title: 'الشحنات وتعيين الموارد | شحنتك',
    description: 'إدارة وتتبع الشحنات المجمعة وتعيين الموارد والناقلين وتتبع الحالات لبوابة الشركة',
};

export default function CompanyShipmentsPage() {
    return (
        <main className="bg-surface-muted">
            <CompanyShipments />
        </main>
    );
}
