import { Metadata } from 'next';
import Vehicles from '@/components/admin/vehicles/Vehicles';

export const metadata: Metadata = {
    title: 'إدارة أسطول المركبات والشاحنات | شحنتك',
    description: 'إدارة وتتبع مركبات الأسطول وسعاتها وأوزانها التشغيلية وحالات تفعيلها',
};

export default function VehiclesPage() {
    return (
        <main className="min-h-screen bg-surface-muted p-4 md:p-8 font-arabic" dir="rtl">
            <Vehicles />
        </main>
    );
}
