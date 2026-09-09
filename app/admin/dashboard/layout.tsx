import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import ClientLayout from '@/components/admin/layout/ClientLayout';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/admin/login');
    }

    const role = (session.user as any)?.role;

    // Block non-admins from Admin Dashboard
    if (role !== 'super' && role !== 'admin') {
        redirect('/company/dashboard');
    }

    return (
        <ClientLayout>
            {children}
        </ClientLayout>
    );
}