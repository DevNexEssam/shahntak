import { Metadata } from 'next';
import Routes from '@/components/admin/routes/Routes';

export const metadata: Metadata = {
    title: 'إدارة المسارات والخطوط اللوجستية | شحنتك',
    description: 'إدارة المسارات والخطوط النقلية والربط بين المدن وتحديد التسعيرات والمدد الزمنية',
};

export default function RoutesPage() {
    return (
        <main className="bg-surface-muted">
            <Routes />
        </main>
    );
}