import { Metadata } from 'next';
import Carriers from '@/components/admin/carriers/Carriers';

export const metadata: Metadata = {
    title: 'إدارة الناقلين والشركاء | شحنتك',
    description: 'إدارة وتتبع الناقلين الشركاء والربط البرمجي المحلي والتنفيذي بالمنصة',
};

export default function CarriersPage() {
    return (
        <main className="bg-surface-muted">
            <Carriers />
        </main>
    );
}
