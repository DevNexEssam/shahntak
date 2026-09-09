import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import CompanyClientLayout from '@/components/company/layout/CompanyClientLayout';

export default async function CompanyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/company/login');
    }

    const role = (session.user as any)?.role;

    // Block Platform Admins ('super' or 'admin') from Company Dashboard
    if (role === 'super' || role === 'admin') {
        redirect('/admin/dashboard');
    }

    return (
        <CompanyClientLayout>
            {children}
        </CompanyClientLayout>
    );
}
