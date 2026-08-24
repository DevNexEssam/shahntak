# 🗺️ خريطة الطريق والتقدم في التطوير (Development Roadmap & Progress)

> **ملاحظة**: هذا الملف يوثق ما تم إنجازه مؤخراً في مشروع **"شحنتك" (Shahntak)** والخطوات الترتيبية القادمة لاستكمال ربط وتنميط باقي صفحات لوحة التحكم بالاعتماد على الماستر بلوبرينت.

---

## ✅ 1. ما تم إنجازه مؤخراً (Completed Work)

### 1.1 بناء وتوحيد أنواع البيانات (TypeScript Types in [`types/data.ts`](file:///e:/projects/shahntak/types/data.ts))
* تم إنشاء وتأمين الـ Interfaces لكافة نماذج قاعدة البيانات الـ 13:
  * `User`, `Company`, `CompanyUser`, `Carrier`, `Vehicle`, `Route`, `Order`, `Shipment`, `Waybill`, `Invoice`, `Payment`, `TrackingEvent`, `Notification`.
* توثيق أنماط الاستجابات القياسية الموحدة للفرد والجمع والحذف (`ResourceResponse`, `ResourceSingleResponse`, `ResourceDeleteResponse`).

### 1.2 بناء وتطوير طبقة الخدمات (Services Layer in [`/services`](file:///e:/projects/shahntak/services))
* بناء 13 خدمة برمجية موحدة متصلة بالـ APIs مع عزل طلبات `axios` والـ HTTP logic بالكامل لكافة الموديلات الـ 13.

### 1.3 بناء وتطوير طبقة الـ Custom React Query Hooks (13 Mongoose Models)
* تم بناء وتأكيد كافة ملفات الـ Hooks الـ 13 بنجاح داخل مجلد [`/hooks`](file:///e:/projects/shahntak/hooks) مع مفاتيح التخزين الموحدة (`Query Key Factories`) والتنبيهات المباشرة.

### 1.4 تنميط وبناء قسمي الشركات والمستخدمين بالكامل
* **قسم الشركات (`components/admin/companies/`)**: تم تحويله بالكامل لربط حقيقي متكامل بالباك إند (`Companies.tsx`, `AddCompanies.tsx`, `EditCompanies.tsx`, `DetailsCompanies.tsx`).
* **قسم المستخدمين والمدراء (`components/admin/users/`)**: تم تنميطه وتوصيله بالكامل بـ Hooks والـ Zod Schemas وإضافة الـ SEO Metadata في صفحة السيرفر.

### 1.5 اعتماد الدليل الموحد الشامل لبناء صفحات لوحة التحكم ([`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md))
* تم دمج وتطوير الماستر بلوبرينت المعياري الموحد المخصص ليكون المرجع الأساسي المباشر عند بناء أو تنميط أي صفحة جديدة في المنصة، شاملاً القواعد الخمس الرئيسية، قائمة التحقق (Checklist)، والنماذج المرجعية الحية.

### 1.6 اجتياز فحص البناء والإنتاج بنجاح
* اجتياز فحص الأنواع بنجاح بدون أخطاء (`npx tsc --noEmit`).
* اجتياز فحص البناء الإنتاجي الكامل وتوليد الصفحات المجمعة بنجاح (`npm run build`).

---

## 🎯 2. الخطوة الترتيبية القادمة للمرة القادمة (Next Steps: Completing Remaining Admin Pages)

في الجلسة القادمة، سيتم استكمال تنميط وربط باقي صفحات لوحة التحكم بـ **React Query Hooks** ومخططات **Zod Validation** بالاعتماد على [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) بحسب الترتيب التالي:

1. 👥 **قسم موظفي الشركات والصلاحيات (`app/admin/(pages)/company-users/`)**:
   - ربط `<CompanyUsersSection />` بـ `useCompanyUsers`, `useCreateCompanyUser`, `useUpdateCompanyUserRoleAndPermissions`.
2. 🚚 **قسم الناقلين المتعاقد معهم (`app/admin/(pages)/carriers/`)**:
   - ربط `<CarriersSection />` بـ `useCarriers`, `useToggleCarrierStatus`, `useDeleteCarrier`.
3. 🚛 **قسم الأسطول والشاحنات (`app/admin/(pages)/vehicles/`)**:
   - ربط `<VehiclesSection />` بـ `useVehicles`, `useUpdateVehicleCapacities`, `useCreateVehicle`.
4. 🗺️ **قسم المسارات والخطوط اللوجستية (`app/admin/(pages)/routes/`)**:
   - ربط `<RoutesSection />` بـ `useRoutes`, `useUpdateRoutePricing`, `useCreateRoute`.
5. 📦 **قسم الطلبات والتجميع (`app/admin/(pages)/orders/`)**:
   - ربط `<OrdersSection />` بـ `useOrders`, `useBulkUploadOrders`, `useGroupOrdersToShipment`.
6. 🚛 **قسم الشحنات وتعيين الموارد (`app/admin/(pages)/shipments/`)**:
   - ربط `<ShipmentsSection />` بـ `useShipments`, `useAssignShipmentResources`, `useUpdateShipmentStatus`.
7. 💳 **قسم الفواتير والمدفوعات (`app/admin/(pages)/invoices/` & `payments/`)**:
   - ربط `<InvoicesSection />` بـ `useInvoices`, `useUpdateInvoiceStatus`, `useCreatePayment`.
8. 📍 **قسم تتبع الشحنات اللحظي (`app/admin/(pages)/tracking/`)**:
   - ربط `<TrackingSection />` بـ `useShipmentTrackingEvents`, `useLogTrackingEvent`.

---

## 📊 حالة الـ Hooks ومكونات الواجهة بالأقسام:

| النموذج (Model) | مسار الصفحة | حالة ربط الواجهة وتنميطها | الدليل المعتمد |
| :--- | :--- | :--- | :--- |
| **`Company`** | `/admin/companies` | ✅ **مكتمل بالكامل 100%** | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`User`** | `/admin/users` | ✅ **مكتمل بالكامل 100%** | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`CompanyUser`** | `/admin/company-users` | ⏳ جاري الربط المخطط | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`Carrier`** | `/admin/carriers` | ⏳ جاري الربط المخطط | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`Vehicle`** | `/admin/vehicles` | ⏳ جاري الربط المخطط | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`Route`** | `/admin/routes` | ⏳ جاري الربط المخطط | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`Order`** | `/admin/orders` | ⏳ جاري الربط المخطط | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`Shipment`** | `/admin/shipments` | ⏳ جاري الربط المخطط | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`Invoice`** | `/admin/invoices` | ⏳ جاري الربط المخطط | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`Payment`** | `/admin/payments` | ⏳ جاري الربط المخطط | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`TrackingEvent`**| `/admin/tracking` | ⏳ جاري الربط المخطط | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
