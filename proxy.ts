import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Dynamic redirect for unauthenticated users based on requested portal
        if (!token) {
            const loginPath = path.startsWith("/doctor")
                ? "/doctor/login"
                : path.startsWith("/admin")
                ? "/admin/login"
                : path.startsWith("/clinic")
                ? "/clinic/login"
                : "/login/patient";
            const redirectUrl = new URL(loginPath, req.url);
            redirectUrl.searchParams.set("callbackUrl", req.url);
            return NextResponse.redirect(redirectUrl);
        }

        const role = token?.role as string | undefined;

        // Ensure role is treated correctly
        const isReception = role === "reception" || role === "استقبال";
        const isDoctor = role === "doctor" || role === "طبيب";

        // Protect clinic dashboard routes
        if (path.startsWith("/clinic/dashboard")) {

            if (isReception) {
                if (path === "/clinic/dashboard") {
                    return NextResponse.redirect(new URL("/clinic/dashboard/waitlist", req.url));
                }
                const restrictedForReception = [
                    "/clinic/dashboard/financial-reports",
                    "/clinic/dashboard/settings",
                    "/clinic/dashboard/employees",
                    "/clinic/dashboard/audit-logs",
                    "/clinic/dashboard/medical-records",
                    "/clinic/dashboard/specialties",
                    "/clinic/dashboard/patient-reports",
                    "/clinic/dashboard/clinical-reports",
                    "/clinic/dashboard/appointment-reports",
                    "/clinic/dashboard/daily-stats",
                    "/clinic/dashboard/reports",
                    "/clinic/dashboard/branches"
                ];

                if (restrictedForReception.some(r => path.startsWith(r))) {
                    return NextResponse.redirect(new URL("/clinic/dashboard/patients", req.url));
                }
            }

            // Restrictions for Doctor
            if (isDoctor) {
                const restrictedForDoctor = [
                    "/clinic/dashboard/financial-reports",
                    "/clinic/dashboard/billing",
                    "/clinic/dashboard/settings",
                    "/clinic/dashboard/employees",
                    "/clinic/dashboard/audit-logs",
                    "/clinic/dashboard/specialties",
                    "/clinic/dashboard/services",
                    "/clinic/dashboard/branches"
                ];

                if (restrictedForDoctor.some(r => path.startsWith(r))) {
                    return NextResponse.redirect(new URL("/clinic/dashboard/patients", req.url));
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
    matcher: ["/clinic/dashboard/:path*", "/doctor/dashboard/:path*", "/admin/dashboard/:path*", "/patient/dashboard/:path*"]
};
