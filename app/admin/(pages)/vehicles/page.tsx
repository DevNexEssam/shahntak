import { Metadata } from 'next';
import Vehicles from '@/components/admin/vehicles/Vehicles';

export const metadata: Metadata = {
    title: 'إدارة أسطول المركبات والشاحنات | شحنتك',
    description: 'إدارة وتتبع مركبات الأسطول وسعاتها وأوزانها التشغيلية وحالات تفعيلها',
};

export default function VehiclesPage() {
    return (
        <main className="bg-surface-muted">
            <Vehicles />
        </main>
    );
}
