import Plans from "@/components/admin/plans/Plans";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "إدارة الباقات السحابية - لوحة التحكم منصة شحنتك",
    description: "تصفح وتخصيص باقات اشتراكات الشركات والحدود المتاحة للطلبات والشحنات",
};

export default function PlansPage() {
    return <Plans />;
}
