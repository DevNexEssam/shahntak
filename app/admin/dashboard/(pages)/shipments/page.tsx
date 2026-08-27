import { Metadata } from 'next';
import Shipments from '@/components/admin/shipments/Shipments';

export const metadata: Metadata = {
    title: 'إدارة الشحنات وتعين الموارد | شحنتك',
    description: 'إدارة وتتبع الشحنات اللوجستية وتعيين الموارد والمسارات والناقلين بالمنصة',
};

export default function ShipmentsPage() {
    return (
        <main className="bg-surface-muted">
            <Shipments />
        </main>
    );
}
