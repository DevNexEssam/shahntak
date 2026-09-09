import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // 1. Dynamic login redirect for unauthenticated users
        if (!token) {
            const loginPath = path.startsWith("/admin")
                ? "/admin/login"
                : "/company/login";
            const redirectUrl = new URL(loginPath, req.url);
            redirectUrl.searchParams.set("callbackUrl", req.url);
            return NextResponse.redirect(redirectUrl);
        }

        const role = token?.role as string | undefined;

        // 2. Protect Admin Dashboard (/admin/dashboard/:path*)
        // Only Super Admin ('super') and Platform Admin ('admin') are allowed
        if (path.startsWith("/admin/dashboard")) {
            if (role !== "super" && role !== "admin") {
                return NextResponse.redirect(new URL("/company/dashboard", req.url));
            }
        }

        // 3. Protect Company Portal & Sub-Role Permissions (/company/dashboard/:path*)
        if (path.startsWith("/company/dashboard")) {
            // Block Platform Admins ('super' or 'admin') from entering Company Portal
            if (role === "super" || role === "admin") {
                return NextResponse.redirect(new URL("/admin/dashboard", req.url));
            }

            // Staff employees have restricted access to sensitive areas (Invoices, Settings, Employees)
            if (role === "staff") {
                const restrictedForStaff = [
                    "/company/dashboard/invoices",
                    "/company/dashboard/settings",
                    "/company/dashboard/employees"
                ];

                if (restrictedForStaff.some(r => path.startsWith(r))) {
                    return NextResponse.redirect(new URL("/company/dashboard/orders", req.url));
                }
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: () => true, // Pass control to middleware function to handle dynamic login redirect per portal
        },
    }
);

export const config = {
    matcher: ["/admin/dashboard/:path*", "/company/dashboard/:path*"]
};

