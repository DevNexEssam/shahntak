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

### 1.11 تنميط وتخريج قسم الناقلين المتعاقد معهم (`admin/dashboard/carriers`)
* إنشاء وتنميط مكونات الواجهة الموحدة بالكامل (`Carriers.tsx`, `AddCarriers.tsx`, `EditCarriers.tsx`, `DetailsCarriers.tsx`).
* إتاحة الفلترة والبحث السيرفري باسم الناقل والجوال والبريد والنوع (`local` / `external_api`).
* ربط الحذف المادي المباشر وتحديث القائمة الجانبية وإحراز بناء خالي من الأخطاء 100%.

### 1.12 تنميط وتخريج قسم الشحنات وتعيين الموارد (`admin/dashboard/shipments`)
* إنشاء وتنميط مكونات الواجهة بالكامل (`Shipments.tsx`, `AddShipments.tsx`, `EditShipments.tsx`, `DetailsShipments.tsx`).
* توليد رقم الشحنة افتراضياً تلقائياً (`SHP-Year-XXX`) لحماية تكرار أو خطأ الإدخال المانوي.
* ربط اختيار الشركة والمسار والناقل والمركبة وإتاحة `step="any"` لتكلفة وسعر الشحن.

### 1.13 تنميط وتخريج قسم سداد المدفوعات والمعاملات المالية (`admin/dashboard/payments`)
* إنشاء وتنميط مكونات الواجهة بالكامل (`Payments.tsx`, `AddPayments.tsx`, `EditPayments.tsx`, `DetailsPayments.tsx`).
* الربط بالفواتير المستحقة وتحديث حالة الفاتورة تلقائياً في الباك إند إلى "مدفوعة ومحصلة" فور إثبات السداد.
* استخدام `step="any"` لمبالغ التحويلات وإزالة الأقواس واللغة الإنجليزية في الخيارات المنبثقة.

### 1.14 تفعيل سيناريو التجميع التلقائي للطلبات وأتمتة البوالص والتحديث الشلالي
* **تجميع الطلبات والتعرف الآلي (Order Grouping & Auto-Fill)**: تفعيل التحديد المتعدد (Checkboxes) في جدول الطلبات (`Orders.tsx`) مع تخصيص نافذة التجميع المباشرة عنواناً وهدفاً (`تجميع X طلبات في شحنة واحدة`)، وتوليد رقم الشحنة ورقم البوليصة آلياً دون الحاجة لإدخال برلمجي يدوياً، واستخراج الشركة والوجهة المشتركة تلقائياً للطلبات المحددة.
* **أتمتة البوالص وتوليد المستندات (Waybills Auto-Generation)**: توليد رقم بوليصة فريد تلقائياً (`waybillNumber: WB-YYYY-XXXX`) وتخزينه في مستند الشحنة ومجموعة `Waybill` وإضافة زر الطباعة المباشرة 🖨️ في جدول الشحنات.
* **التحديث الشلالي للحالات (Cascade Status Update)**: ربط الباك إند (`shipments/[id]/route.ts`) بتحديث كافة الطلبات التابعة للشحنة تلقائياً لشلالياً فور تغيير حالة الشحنة إلى `delivered` (تم التسليم) أو `returned` (مرتجعة) أو `cancelled` (ملغاة).
* **أتمتة الفواتير ورقم الفاتورة الآلي (Auto Invoice Generation)**: إلغاء حقل مدخلات رقم الفاتورة من نموذج الإدخال (`AddInvoices.tsx`) ليتم توليد رقم الفاتورة فريداً أوتوماتيكياً من الباك إند (`invoices/new/route.ts`) برقم تسلسلي مثل (`INV-YYYY-XXXXX`) دون الحاجة لكتابة أو ظهور الرقم قبل الإنشاء.
* **التحديث اللحظي المباشر بدون إعادة تحميل (Real-Time Live Updates)**: تفعيل المراقبة بالخلفية (`refetchInterval: 3000`) والربط التبادلي لإبطال الكاش (`Cross-Invalidation`) في React Query بين الطلبات والشحنات، مما يضمن تحديث حالة الطلبات والتوصيل لحظياً وبشكل فوري تلقائياً دون الحاجة لأن يقوم المستخدم بعاقبة الـ Refresh أو الضغط المانوي.
* **تعريب وتحسين الواجهات (RTL & Clean Dropdowns)**: توحيد الخيارات المنبثقة باللغة العربية الخالصة وتصفية النصوص الإنجليزية في جميع مودالات الشحنات (`AddShipments.tsx`, `EditShipments.tsx`).

### 1.15 بناء ونظام الباقات والاشتراكات السحابية وحماية الحصص وتنميط الواجهات (`Subscription & Plan System`)
* **نمذجة الباقات السحابية (`Plan Model`)**: إنشاء نموذج `Plan` وإتاحة تخصيص أسعار ودورة الفوترة (شهري/سنوي) والحدود الشهرية المسموحة للطلبات والشحنات والموظفين وميزات الباقة.
* **إدارة اشتراكات الشركات (`Subscription Model`)**: إنشاء نموذج `Subscription` لمتابعة صلاحية اشتراكات الشركات، تاريخ البدء والانتهاء، التجديد التلقائي وعداد الاستهلاك الشهرية.
* **حماية حصص الاستهلاك (`Quota Enforcement`)**: ربط الباك إند (`orders/new/route.ts`) بفحص حصة الطلبات المتبقية بالباقة النشطة ومنع الإضافة التلقائي وتنبيه الموظف فور تجاوز حد الباقة المسموح.
* **تطبيق دليل التصاميم المعتمد (`ADMIN_UI_DESIGN_SYSTEM.md`)**:
  * تطبيق التصميم القياسي الخالي من الظلال (`border border-border rounded-md` و `rounded-sm`) على جداول وكروت وفلاتر الأقسام.
  * توحيد كروت الـ KPI بأيقونات دائرية ملونة `w-10 h-10 rounded-full bg-accent-soft text-accent`.
  * تطابق كلي لمودالات الإضافة والتعديل والتفاصيل (`AddPlans`, `EditPlans`, `DetailsPlans`, `AddSubscriptions`, `EditSubscriptions`, `DetailsSubscriptions`).
  * إضافة رابطي "الباقات السحابية" 💳 و "اشتراكات الشركات" 👑 بالقائمة الجانبية (`AdminSidebar.tsx`).
* **التشغيل والربط والتأكيد**: نجاح كافة فحوصات الأنواع `npx tsc --noEmit` وتأكيد بناء النسخة الإنتاجية `npm run build` بنسبة 100%.

### 1.16 إنجاز المرحلة الأولى بالكامل لبوابة الشركة المشتركة (`Company Portal Phase 1`)
* **التأسيس التقني وعزل المستأجرين**: تطبيق معالج `withCompanyGuard` لـ HOC APIs وإضافة `checkSubscriptionQuota` لفحص الحصص وتأمين الاستعلامات المعزولة بـ `companyId`.
* **توحيد طبقة الخدمات والهواكس المعيارية (`Services & Custom React Query Hooks`)**:
  * بناء 6 خدمات مستقلة داخل مجلد [`services/company/`](file:///e:/projects/shahntak/services/company) (`CompanyOrderServices`, `CompanyShipmentServices`, `CompanyInvoiceServices`, `CompanyEmployeeServices`, `CompanyReportServices`, `CompanySettingsServices`).
  * بناء 6 ملفات Hooks مستقلة داخل مجلد [`hooks/company/`](file:///e:/projects/shahntak/hooks/company) تطبق نمط المفاتيح القياسي `as const` وتدرج `useQuery` و `useMutation` والتنبيهات المباشرة.
  * إنشاء هوك الصلاحيات `useCompanyPermission`.
* **التحقق التام**: نجاح كامل لفحوصات الأنواع والبناء الإنتاجي `npm run build` بنسبة 100%.

### 1.17 استكمال مسارات الـ Backend المعزولة لبوابة الشركة (`Company Portal Backend APIs`)
* **إنشاء وتأمين مسارات الـ API بالكامل (`app/api/company/*`)**:
  * **الطلبات (`Orders`)**: `GET`, `POST /new`, `GET/PUT/DELETE /[id]`.
  * **الشحنات (`Shipments`)**: `GET`, `POST /new`, `GET/PUT/DELETE /[id]`.
  * **الفواتير (`Invoices`)**: `GET`, `POST /new`, `GET/PUT/DELETE /[id]`.
  * **التقارير والإحصائيات (`Reports`)**: `GET /api/company/reports`.
* **الأمان والقواعد القياسية**: تطبيق العزل الشفاف بـ `companyId` المأخوذ من الجلسة الموثقة، Zod validation، وتوليد الأرقام التسلسلية آلياً، والالتزام بكتابة تعليقات إنجليزية مقتضبة وبدون إيموجيات.

### 1.18 بناء وتطبيق التخطيط الرئيسي لبوابة الشركات (`Company Portal Layout - Phase 2`)
* **تخطيط لوحة الداشبورد (`app/company/dashboard/layout.tsx`)**: دمج السايدبار والهيدر والمحتوى الرئيسي بتأثيرات وقواعد التصميم القياسية RTL.
* **الشريط الجانبي (`CompanySidebar.tsx`)**: تصميم مطابق لـ `AdminSidebar` مع روابط الأقسام الثمانية المخصصة للشركة وبطاقة الجلسة وتسجيل الخروج.
* **الهيدر العلوي (`CompanyHeader.tsx`)**: شريط بحث موحد، شارة الباقة النشطة، وزر الإضافة السريعة والإشعارات.
* **فحص والسلامة البرمجية**: اجتياز فحص الأنواع `npx tsc --noEmit` بنجاح وتأكيد خلو الكود من أي أخطاء بنسبة 100%.

---

## 🎯 2. الخطوة الترتيبية القادمة للمرة القادمة (Next Steps)

في الجلسة القادمة، سيتم استكمال تنميط وربط القسم المتبقي من لوحة التحكم بالاعتماد على [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) بحسب الترتيب التالي:

1. 📍 **قسم تتبع الشحنات اللحظي والأحداث (`app/admin/(pages)/tracking/`)**:
   - ربط المراقبة اللحظية لنقاط الترانزيت وتسجيل الأحداث بـ `useShipmentTrackingEvents`, `useLogTrackingEvent`.

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
| **`Shipment`** | `/admin/shipments` | ✅ **مكتمل بالكامل 100%** | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`Invoice`** | `/admin/invoices` | ✅ **مكتمل بالكامل 100%** | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`Payment`** | `/admin/payments` | ✅ **مكتمل بالكامل 100%** | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
| **`Plan`** | `/admin/dashboard/plans` | ✅ **مكتمل بالكامل 100%** | [`ADMIN_UI_DESIGN_SYSTEM.md`](file:///e:/projects/shahntak/content/ADMIN_UI_DESIGN_SYSTEM.md) |
| **`Subscription`** | `/admin/dashboard/subscriptions` | ✅ **مكتمل بالكامل 100%** | [`ADMIN_UI_DESIGN_SYSTEM.md`](file:///e:/projects/shahntak/content/ADMIN_UI_DESIGN_SYSTEM.md) |
| **`TrackingEvent`**| `/admin/tracking` | ⏳ جاري الربط المخطط | [`ADMIN_PAGES_MASTER_BLUEPRINT.md`](file:///e:/projects/shahntak/content/ADMIN_PAGES_MASTER_BLUEPRINT.md) |
