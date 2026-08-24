# 🗺️ خريطة الطريق والتقدم في التطوير (Development Roadmap & Progress)

> **ملاحظة**: هذا الملف يوثق ما تم إنجازه مؤخراً في مشروع **"شحنتك" (Shahntak)** والخطوات الترتيبية القادمة للبدء في بناء طبقة الـ **Custom Hooks** والربط مع الواجهات.

---

## ✅ 1. ما تم إنجازه مؤخراً (Completed Work)

### 1.1 بناء وتوحيد أنواع البيانات (TypeScript Types in [`types/data.ts`](file:///e:/projects/shahntak/types/data.ts))
* تم إنشاء وتأمين الـ Interfaces لكافة نماذج قاعدة البيانات الـ 13:
  * `User`, `Company`, `CompanyUser`, `Carrier`, `Vehicle`, `Route`, `Order`, `Shipment`, `Waybill`, `Invoice`, `Payment`, `TrackingEvent`, `Notification`.
* توثيق أنماط الاستجابات القياسية الموحدة للفرد والجمع والحذف:
  * `ResourceResponse` (استجابة الجلب والترقيم والـ Stats).
  * `ResourceSingleResponse` (استجابة عنصر فردي).
  * `ResourceDeleteResponse` (استجابة الحذف).

### 1.2 بناء وتطوير طبقة الخدمات (Services Layer in [`/services`](file:///e:/projects/shahntak/services))
* بناء 13 خدمة برمجية موحدة متصلة بالـ APIs مع عزل طلبات `axios` والـ HTTP logic بالكامل:
  * `userServices.ts` (إدارة المستخدمين والمدراء).
  * `companyServices.ts` (إدارة الشركات وحالاتها وتوثيق الموافقة `approvedBy`).
  * `companyUserServices.ts` (إدارة موظفي الشركات والصلاحيات).
  * `carrierServices.ts` (إدارة الناقلين المتعاقد معهم).
  * `vehicleServices.ts` (إدارة الأسطول والشاحنات والأحمال).
  * `routeServices.ts` (إدارة المسارات والخطوط والأسعار).
  * `orderServices.ts` (إدارة الطلبات الفردية والـ `bulkUpload` وتجميع الشحنات).
  * `shipmentServices.ts` (إدارة الشحنات وربط الناقلين وتحديث الحالات).
  * `waybillServices.ts` (توليد بوالص الشحن PDF).
  * `invoiceServices.ts` (إدارة الفواتير والحسابات اللوجستية).
  * `paymentServices.ts` (إثبات سداد الفواتير وتحديث الحالات تلقائياً).
  * `trackingEventServices.ts` (سجل تتبع حركة الشحنات).
  * `notificationServices.ts` (إدارة وتوجيه التنبيهات والإشعارات).

### 1.3 بناء وتطوير طبقة الـ Custom React Query Hooks لكافة نماذج النظام (الـ 13 Mongoose Models)
* تم بناء وتأكيد كافة ملفات الـ Hooks الـ 13 بنجاح داخل مجلد [`/hooks`](file:///e:/projects/shahntak/hooks) بالنمط الهيكلي المعزول والتنبيهات المباشرة:
  * [`hooks/users/useUsers.ts`](file:///e:/projects/shahntak/hooks/users/useUsers.ts)
  * [`hooks/companies/useCompanies.ts`](file:///e:/projects/shahntak/hooks/companies/useCompanies.ts)
  * [`hooks/companyUsers/useCompanyUsers.ts`](file:///e:/projects/shahntak/hooks/companyUsers/useCompanyUsers.ts)
  * [`hooks/carriers/useCarriers.ts`](file:///e:/projects/shahntak/hooks/carriers/useCarriers.ts)
  * [`hooks/vehicles/useVehicles.ts`](file:///e:/projects/shahntak/hooks/vehicles/useVehicles.ts)
  * [`hooks/routes/useRoutes.ts`](file:///e:/projects/shahntak/hooks/routes/useRoutes.ts)
  * [`hooks/orders/useOrders.ts`](file:///e:/projects/shahntak/hooks/orders/useOrders.ts)
  * [`hooks/shipments/useShipments.ts`](file:///e:/projects/shahntak/hooks/shipments/useShipments.ts)
  * [`hooks/waybills/useWaybills.ts`](file:///e:/projects/shahntak/hooks/waybills/useWaybills.ts)
  * [`hooks/invoices/useInvoices.ts`](file:///e:/projects/shahntak/hooks/invoices/useInvoices.ts)
  * [`hooks/payments/usePayments.ts`](file:///e:/projects/shahntak/hooks/payments/usePayments.ts)
  * [`hooks/trackingEvents/useTrackingEvents.ts`](file:///e:/projects/shahntak/hooks/trackingEvents/useTrackingEvents.ts)
  * [`hooks/notifications/useNotifications.ts`](file:///e:/projects/shahntak/hooks/notifications/useNotifications.ts)

### 1.4 التحقق والالتزام البنائي
* تم فحص جميع الملفات بدون أي أخطاء برمجة أو نمط (`npx tsc --noEmit`).
* تم بناء وتأكيد النسخة الإنتاجية بنجاح (`npm run build`).

---

## 🎯 2. الخطوة الحالية القادمة (Next Immediate Step: Admin UI Components & Page Integration)

بعد الانتهاء من بناء طبقة الـ Custom Hooks بالكامل، الخطوة التالية هي **ربط الـ Hooks بمكونات الواجهة وصفحات لوحة التحكم (Admin Dashboard Pages)**.

### 📋 قائمة الـ Hooks المنجزة بالكامل لكل Model:

| النموذج (Model) | ملف الـ Hook المسئول | الحالة | الـ Hooks التفصيلية المنجزة |
| :--- | :--- | :--- | :--- |
| **`User`** | `hooks/users/useUsers.ts` | ✅ مكتمل | `useUsers()`, `useUser(id)`, `useCreateUser()`, `useUpdateUser()`, `useDeleteUser()` |
| **`Company`** | `hooks/companies/useCompanies.ts` | ✅ مكتمل | `useCompanies()`, `useAllCompanies()`, `useCompany(id)`, `useCreateCompany()`, `useUpdateCompany()`, `useUpdateCompanyStatus()`, `useApproveCompany()`, `useDeleteCompany()` |
| **`CompanyUser`** | `hooks/companyUsers/useCompanyUsers.ts` | ✅ مكتمل | `useCompanyUsers()`, `useAllCompanyUsers()`, `useCompanyUser(id)`, `useCreateCompanyUser()`, `useUpdateCompanyUser()`, `useUpdateCompanyUserRoleAndPermissions()`, `useDeleteCompanyUser()` |
| **`Carrier`** | `hooks/carriers/useCarriers.ts` | ✅ مكتمل | `useCarriers()`, `useAllCarriers()`, `useCarrier(id)`, `useCreateCarrier()`, `useUpdateCarrier()`, `useToggleCarrierStatus()`, `useDeleteCarrier()` |
| **`Vehicle`** | `hooks/vehicles/useVehicles.ts` | ✅ مكتمل | `useVehicles()`, `useAllVehicles()`, `useVehicle(id)`, `useCreateVehicle()`, `useUpdateVehicle()`, `useUpdateVehicleCapacities()`, `useDeleteVehicle()` |
| **`Route`** | `hooks/routes/useRoutes.ts` | ✅ مكتمل | `useRoutes()`, `useAllRoutes()`, `useRoute(id)`, `useCreateRoute()`, `useUpdateRoute()`, `useUpdateRoutePricing()`, `useDeleteRoute()` |
| **`Order`** | `hooks/orders/useOrders.ts` | ✅ مكتمل | `useOrders()`, `useAllOrders()`, `useOrder(id)`, `useCreateOrder()`, `useBulkUploadOrders()`, `useUpdateOrder()`, `useGroupOrdersToShipment()`, `useDeleteOrder()` |
| **`Shipment`** | `hooks/shipments/useShipments.ts` | ✅ مكتمل | `useShipments()`, `useAllShipments()`, `useShipment(id)`, `useCreateShipment()`, `useUpdateShipment()`, `useAssignShipmentResources()`, `useUpdateShipmentStatus()`, `useDeleteShipment()` |
| **`Waybill`** | `hooks/waybills/useWaybills.ts` | ✅ مكتمل | `useWaybills()`, `useWaybill(id)`, `useGenerateWaybill()`, `useCreateWaybill()`, `useDeleteWaybill()` |
| **`Invoice`** | `hooks/invoices/useInvoices.ts` | ✅ مكتمل | `useInvoices()`, `useAllInvoices()`, `useInvoice(id)`, `useCreateInvoice()`, `useUpdateInvoice()`, `useUpdateInvoiceStatus()`, `useDeleteInvoice()` |
| **`Payment`** | `hooks/payments/usePayments.ts` | ✅ مكتمل | `usePayments()`, `usePayment(id)`, `useCreatePayment()`, `useDeletePayment()` |
| **`TrackingEvent`** | `hooks/trackingEvents/useTrackingEvents.ts` | ✅ مكتمل | `useShipmentTrackingEvents(shipmentId)`, `useLogTrackingEvent()`, `useDeleteTrackingEvent()` |
| **`Notification`** | `hooks/notifications/useNotifications.ts` | ✅ مكتمل | `useNotifications(recipientId)`, `useSendNotification()`, `useMarkNotificationAsRead()`, `useDeleteNotification()` |

---

## 🚀 3. الخطوات المستقبلية اللاحقة (Future Roadmap)

1. **مكونات صفحات لوحة التحكم (Admin UI Pages)**:
   * ربط الـ Hooks في صفحات `app/admin/(pages)/` (الشركات، الفواتير، الطلبات، الشحنات، المسارات، التنبيهات، الإعدادات).
2. **النماذج والتحقق (React Hook Form & Zod)**:
   * إنشاء مكونات Form موحدة تعتمد على `lib/validations/` لإضافة وتعديل الكيانات.
3. **معالجة التنبيهات والأخطاء (Toasts & Notifications)**:
   * إضافة مكتبة تنبيهات (مثل `sonner` أو `react-hot-toast`) لإظهار رسائل النجاح والفشل عند تنفيذ عمليات التعديل والإنشاء والحذف.
