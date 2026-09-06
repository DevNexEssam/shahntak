import { Metadata } from "next";
import { CompanySettings } from "@/components/company/settings/CompanySettings";

export const metadata: Metadata = {
    title: "إعدادات الشركة | بوابة الشركة",
    description: "إدارة بيانات وملف الشركة والاطلاع على حدود الباقة السحابية النشط",
};

export default function CompanySettingsPage() {
    return <CompanySettings />;
}
