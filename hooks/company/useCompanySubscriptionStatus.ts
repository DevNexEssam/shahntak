/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface CompanySubscriptionStatus {
    subscription: any | null;
    status: 'active' | 'expired' | 'cancelled' | 'pending_payment' | 'no_subscription';
    isExpired: boolean;
    isWarning: boolean;
    daysRemaining: number;
    planName: string;
    isLoading: boolean;
    refetch: () => void;
}

export function useCompanySubscriptionStatus(): CompanySubscriptionStatus {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['company-settings-subscription'],
        queryFn: async () => {
            const res = await axios.get('/api/company/settings');
            return res.data?.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    const subscription = data?.subscription || null;

    if (!subscription) {
        return {
            subscription: null,
            status: 'no_subscription',
            isExpired: false,
            isWarning: false,
            daysRemaining: 0,
            planName: 'لا يوجد اشتراك',
            isLoading,
            refetch,
        };
    }

    const now = new Date();
    const endDate = new Date(subscription.endDate || Date.now());
    const isPastEnd = endDate < now;
    const isExpired = subscription.status === 'expired' || subscription.status === 'cancelled' || isPastEnd;

    const diffTime = endDate.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const isWarning = !isExpired && daysRemaining <= 5;
    const planName = subscription.planId?.name || 'الباقة الحالية';

    return {
        subscription,
        status: isExpired ? 'expired' : subscription.status,
        isExpired,
        isWarning,
        daysRemaining,
        planName,
        isLoading,
        refetch,
    };
}
