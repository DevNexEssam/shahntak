import { Metadata } from "next";
import { CompanyReports } from "@/components/company/reports/CompanyReports";

export const metadata: Metadata = {
    title: "التقارير والإحصائيات | بوابة الشركة",
    description: "متابعة أداء العمليات والشحنات والتحليلات المالية لشركة الشحن",
};

export default function CompanyReportsPage() {
    return <CompanyReports />;
}
