# 🏢 توثيق مرحلة تنميط وتطوير قسم الشركات المسجلة (Companies Section Standardization & Backend Integration)

> **الملخص**: يوثق هذا المستند مرحلة إعادة بناء وتطوير قسم الشركات المسجلة والمشتريات (`components/admin/companies/`) وتوفير ربط متكامل 100% بالباك إند وقاعدة البيانات Mongoose عبر **TanStack React Query v5** ومخططات **Zod Validation** وتطبيق معايير الدليل القياسي.

---

## 🎯 1. أهداف المرحلة والمُنجزات
* **تحويل من Mock Data لربط برمي حقيقي**: استبدال البيانات الوهمية المسبقة بالاستهلاك المباشر للـ **Custom React Query Hooks** (`useCompanies`, `useCreateCompany`, `useUpdateCompany`, `useDeleteCompany`, `useApproveCompany`, `useUpdateCompanyStatus`).
* **تطبيق الدليل القياسي لسكاشن الأدمن**: اعتماد دليـل النمذجة الموحد [`ADMIN_SECTIONS_STANDARDIZED_GUIDE.md`](file:///e:/projects/shahntak/content/ADMIN_SECTIONS_STANDARDIZED_GUIDE.md) لجميع مكونات القسم (`View`, `Add`, `Edit`, `Details`, `DeletePopup`).
* **الفصل الهيكلي القياسي**: الالتزام بـ [`ADMIN_COMPONENTS_MAPPING.md`](file:///e:/projects/shahntak/content/ADMIN_COMPONENTS_MAPPING.md) بفصل صفحة السيرفر (`Server Component`) عن مكونات العميل التفاعلية (`Client Components`).

---

## 📐 2. الهندسة واللوجيك المعتمد (Architectural & Business Logic)

تم بناء وتنسيق المكونات بناءً على 5 قواعد لوجستية معمارية:

### 1️⃣ التحقق المحلي محكم الصياغة (Local Zod Validation)
* إجراء فحص البيانات المدخلة قبل إرسال أي طلب شبكة باستخدام مخططات Zod المعتمدة في النظام ([`lib/validations/companies.schema.ts`](file:///e:/projects/shahntak/lib/validations/companies.schema.ts)).
* تنظيف مصفوفة الأخطاء `setFieldErrors({})` فور إعادة محاولة التقديم، وتحديد الحقول المعطوبة بإطار أحمر وتعرية نص الخطأ باللغة العربية تحت المدخل مباشرة.

### 2️⃣ معالجة حالات التصفح والبحث (`setPage(1)`)
* عند كتابة نص بحث جديد في مدخل البحث اللحظي أو عند التبديل بين حالات الفلترة (`active`, `inactive`, `banned`), يتم إرجاع الصفحة تلقائياً للأولى `setPage(1)` لمنع ظهور جداول فارغة للمستخدم في الصفحات المتأخرة.

### 3️⃣ تنظيف التحديد وحالة المودال عند الإغلاق (Cleanup Selected Item)
* عند إغلاق مودال التعديل أو التفاصيل، يتم مسح الكائن المختار `setSelectedCompany(null)` فور الإغلاق لمنع استعادة بيانات سابقة بطريقة خاطئة عند إعادة فتح مودال آخر.

### 4️⃣ تجميد المدخلات أثناء الشبكة (`disabled={isSubmitting}`)
* في مودالات الإضافة والتعديل، يتم وضع حالة `disabled={isSubmitting}` على كافة حقول الإدخال والأزرار وإظهار مؤشر التحميل `<Loading />` داخل الزر لمنع تكرار النقر وإرسال الطلبات المزدوجة أثناء معالجة الطلب.

### 5️⃣ الإشعار وتدفق تحديث الكاش (Toast & Cache Invalidation)
* الاعتماد على المكتبة القياسية `react-hot-toast` لإظهار رسائل النجاح الصريحة القادمة من الباك إند أو الرسائل الافتراضية.
* إبطال الاستعلامات تلقائياً `queryClient.invalidateQueries({ queryKey: companyKeys.all })` لإعادة جلب القائمة وتحديث الواجهة فور نجاح الإضافة أو التعديل أو الاعتماد أو الحذف.

---

## 📁 3. تفاصيل المكونات المطوّرة (Component Breakdown)

| المكون (Component) | المسار | اللوجيك والدور الوظيفي |
| :--- | :--- | :--- |
| **`Companies.tsx`** | [`components/admin/companies/Companies.tsx`](file:///e:/projects/shahntak/components/admin/companies/Companies.tsx) | **المكون التفاعلي الرئيسي**: يضم `"use client"`، يدير الترقيم والبحث والفلترة اللحظية والتنقل بين **العرض الشبكي (Grid Cards)** و **عرض الجدول (Table View)**. يربط الـ Hooks ويتحكم بفتح/إغلاق كافة المودالات ومودال تأكيد الحذف المؤقت. |
| **`AddCompanies.tsx`** | [`components/admin/companies/AddCompanies.tsx`](file:///e:/projects/shahntak/components/admin/companies/AddCompanies.tsx) | **مودال إضافة شركة**: متصل بـ `companyCreateValidationSchema` و `useCreateCompany` Mutation. يعرض رسائل أخطاء التحقق باللغة العربية ويجمد الحقول عند الإرسال. |
| **`EditCompanies.tsx`** | [`components/admin/companies/EditCompanies.tsx`](file:///e:/projects/shahntak/components/admin/companies/EditCompanies.tsx) | **مودال تعديل شركة**: يعبئ البيانات الممررة بـ `useEffect` ومربوط بـ `updateCompanyValidationSchema` و `useUpdateCompany` Mutation. |
| **`DetailsCompanies.tsx`** | [`components/admin/companies/DetailsCompanies.tsx`](file:///e:/projects/shahntak/components/admin/companies/DetailsCompanies.tsx) | **مكون جديد**: مودال استعراض تفاصيل الشركة الكاملة (السجل الضريبي، المدينة، البريد، الجوال، العنوان التفصيلي، معلومات المنشأة، وحالة الاعتماد `approvedBy` وتاريخ التسجيل). |
| **`CompaniesPage`** | [`app/admin/(pages)/companies/page.tsx`](file:///e:/projects/shahntak/app/admin/%28pages%29/companies/page.tsx) | **صفحة السيرفر (Server Component)**: مسؤولة عن إعداد SEO Metadata وتغليف المكون التفاعلي الرئيسي. |

---

## 🧪 4. فحص الأمان واجتياز الفحوصات (Verification)
- **TypeScript Check**: اجتياز الفحص بنجاح بدون أي أخطاء (`npx tsc --noEmit`).
- **Soft Delete Compliance**: الالتزام بنمط الحذف المؤقت وحفظ سلامة البيانات التشغيلية والمرجعيات بالنظام.
