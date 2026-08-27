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

### 1.7 بناء وتطوير الحذف الكلي والشلالي لقسم الشركات (Companies Cascading Hard Delete & Soft Delete)
* دعم التمييز التام بين الحذف المؤقت/الأرشفة (Soft Delete) والحذف النهائي (Hard Delete) عبر معامل الاستعلام `?hard=true`.
* تنفيذ الحذف الشلالي الكلي (**Cascading Delete**) لجميع البيانات والكيانات التابعة للشركة في الباك إند (`CompanyUser`, `Order`, `Shipment`, `Invoice`, `Waybill`, `Payment`) في حال اختيار الحذف النهائي.
* تحديث نافذة التأكيد قبل الحذف في الواجهة (`Companies.tsx`) بتوضيح تفصيلي لكافة البيانات التابعة التي سيتم مسحها بشكل نهائي.

### 1.8 تنميط وتوحيد الأقسام الرئيسية ولوحة التحكم 100%
* **قسم الطلبات (`admin/dashboard/orders`)**: تنميط كامل بحسب الدليل المعياري، ربط البحث والفلترة السيرفرية وتوحيد المودالات وتفرغ الحالات.
* **قسم المسارات والمحطات (`admin/dashboard/routes`)**: تفعيل البحث السيرفري الشامل والتصفية وتوحيد الأخطاء ومظهر المودالات.
* **قسم الشاحنات والمركبات (`admin/dashboard/vehicles`)**: ربط الفلترة والإحصائيات السيرفرية وتوحيد كروت الـ KPI الموحدة.
* **قسم البوالص والفواتير المالية (`admin/dashboard/invoices`)**: تجميع المبالغ المحصلة والمستحقات المعلقة، تفعيل الفلترة والبحث السيرفري وتوحيد الجدول والمودالات.
* **قسم إدارة المستخدمين والمدراء (`admin/dashboard/users`)**: البحث السيرفري في الاسم والبريد والجوال، الفلترة بحالة الحساب وتوحيد المودالات والأخطاء.

### 1.9 إضافة صفحة تفاصيل الشركة الشاملة (`admin/dashboard/companies/[id]`)
* بناء API التفاصيل المجمعة السيرفري (`/api/admin/companies/[id]/details`).
* إضافة الأنواع والخدمات والـ Hook المخصص (`useCompanyFullDetails`).
* تصميم وإنشاء صفحة التفاصيل الشاملة بكروت KPI قياسية للبيانات اللوجستية والمالية وسجل الاعتماد الإداري.
* إضافة الزر الانتقالي المباشر الثاني (`LuExternalLink`) في جدول وبطاقات الشركات.

### 1.10 تعميم وتوثيق آليات الحذف النهائي والدائم (Hard Delete Standardization Across All Sections)
* تم تعميم وتأمين نمط الحذف الكلي والنهائي المباشر من قاعدة البيانات (**Hard Delete**) لجميع السكاشن الرئيسية في لوحة التحكم:
  * **الطلبات (`admin/dashboard/orders`)**: إرسال `hard: true` صراحةً وتحديث الـ DELETE API ليقوم بحذف الطلب نهائياً من داتا بيز MongoDB عبر `Order.findByIdAndDelete(id)`.
  * **المسارات والخطوط اللوجستية (`admin/dashboard/routes`)**: تفعيل `hard: true` لربط مودال الحذف بـ `Route.findByIdAndDelete(id)`.
  * **أسطول المركبات والشاحنات (`admin/dashboard/vehicles`)**: إرسال `hard: true` لمسح المركبة من القاعدة فوراً عبر `Vehicle.findByIdAndDelete(id)`.
  * **البوالص والفواتير المالية (`admin/dashboard/invoices`)**: إرسال `hard: true` لإجراء الحذف المادي والمباشر بـ `Invoice.findByIdAndDelete(id)`.
* **الربط مع الـ UI والنواحي الفنية**: توحيد نصوص ومظهر مودال `ConfirmDeletePopup` وتصفير الكائنات المحددة فور النجاح، وإتاحة `step="any"` لجميع مدخلات الأرقام والأسعار والأوزان.

---

## 🎯 2. الخطوة الترتيبية القادمة للمرة القادمة (Next Steps)

في الجلسة القادمة، سيتم استكمال تنميط وربط باقي صفحات لوحة التحكم بالاعتماد على [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) بحسب الترتيب التالي:

1. 🚚 **قسم الناقلين المتعاقد معهم (`app/admin/(pages)/carriers/`)**:
   - ربط `<CarriersSection />` بـ `useCarriers`, `useToggleCarrierStatus`, `useDeleteCarrier`.
2. 🚛 **قسم الشحنات وتعيين الموارد (`app/admin/(pages)/shipments/`)**:
   - ربط `<ShipmentsSection />` بـ `useShipments`, `useAssignShipmentResources`, `useUpdateShipmentStatus`.
3. 💳 **قسم الفواتير والمدفوعات (`app/admin/(pages)/payments/`)**:
   - ربط `<PaymentsSection />` بـ `usePayments`, `useCreatePayment`.
4. 📍 **قسم تتبع الشحنات اللحظي (`app/admin/(pages)/tracking/`)**:
   - ربط `<TrackingSection />` بـ `useShipmentTrackingEvents`, `useLogTrackingEvent`.

---

## 📊 حالة الـ Hooks ومكونات الواجهة بالأقسام:

| النموذج (Model) | مسار الصفحة | حالة ربط الواجهة وتنميطها | الدليل المعتمد |
| :--- | :--- | :--- | :--- |
| **`Company`** | `/admin/companies` | ✅ **مكتمل بالكامل 100%** | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`User`** | `/admin/users` | ✅ **مكتمل بالكامل 100%** | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`CompanyUser`** | `/admin/company-users` | ✅ **مكتمل بالكامل 100%** | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`Carrier`** | `/admin/carriers` | ✅ **مكتمل بالكامل 100%** | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`Vehicle`** | `/admin/vehicles` | ✅ **مكتمل بالكامل 100%** | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`Route`** | `/admin/routes` | ✅ **مكتمل بالكامل 100%** | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`Order`** | `/admin/orders` | ✅ **مكتمل بالكامل 100%** | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`Shipment`** | `/admin/shipments` | ⏳ جاري الربط المخطط | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`Invoice`** | `/admin/invoices` | ✅ **مكتمل بالكامل 100%** | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`Payment`** | `/admin/payments` | ⏳ جاري الربط المخطط | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`TrackingEvent`**| `/admin/tracking` | ⏳ جاري الربط المخطط | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
