import React from 'react';
import CompanyRoutes from '@/components/company/routes/CompanyRoutes';

export const metadata = {
    title: 'إدارة المسارات والخطوط اللوجستية | بوابة الشركات - شحنتك',
    description: 'إدارة خطوط النقل بين المدن والوجهات وتحديد الأسعار الأساسية وأوقات الترانزيت لشركة الشحن',
};

export default function CompanyRoutesPage() {
    return <CompanyRoutes />;
}
