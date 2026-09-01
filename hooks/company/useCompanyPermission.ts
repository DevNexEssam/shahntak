/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSession } from "next-auth/react";
import { can } from "@/utils/permissions";
import { PermissionAction, UserRole } from "@/types/data";

export function useCompanyPermission() {
    const { data: session } = useSession();
    const role = (session?.user as any)?.role as UserRole | undefined;

    const checkPermission = (resource: string, action: PermissionAction): boolean => {
        if (!role) return false;
        return can(role, resource, action);
    };

    return {
        can: checkPermission,
        role,
        companyId: (session?.user as any)?.companyId as string | undefined,
        branchId: (session?.user as any)?.branchId as string | undefined,
        userId: session?.user?.id,
    };
}
