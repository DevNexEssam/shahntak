import Subscriptions from "@/components/admin/subscriptions/Subscriptions";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "اشتراكات الشركات وحصص الاستهلاك - لوحة التحكم منصة شحنتك",
    description: "متابعة الاشتراكات السحابية للشركات، معدلات الاستهلاك، الترقية والتجديد",
};

export default function SubscriptionsPage() {
    return <Subscriptions />;
}
