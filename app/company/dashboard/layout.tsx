import React from 'react';
import CompanyClientLayout from '@/components/company/layout/CompanyClientLayout';

export default async function CompanyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CompanyClientLayout>
            {children}
        </CompanyClientLayout>
    );
}
