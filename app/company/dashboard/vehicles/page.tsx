import { Metadata } from 'next';
import CompanyVehicles from '@/components/company/vehicles/CompanyVehicles';

export const metadata: Metadata = {
    title: 'أسطول المركبات والشاحنات | شحنتك',
    description: 'إدارة أسطول المركبات ومواصفات السعة والحمولات لبوابة الشركة',
};

export default function CompanyVehiclesPage() {
    return (
        <main className="bg-surface-muted">
            <CompanyVehicles />
        </main>
    );
}
