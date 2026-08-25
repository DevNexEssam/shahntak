# 📘 الدليل الموحد الشامل لبناء وتنميط صفحات لوحة التحكم (Admin Pages Master Blueprint)

> **الهدف التشغيلي**: هذا المستند هو **المرجع الرئيسي الشامل** المخصص للرجوع إليه عند بناء، تنميط، أو ربط أي سكشن أو صفحة جديدة في لوحة التحكم (`carriers`, `vehicles`, `routes`, `orders`, `shipments`, `invoices`, `payments`, `tracking`, إلخ)، مستخلصاً ومدمجاً من التجربة العملية لقسمي **الشركات (`companies`)** و **المستخدمين (`users`)**.

---

## 🏛️ 1. المخطط المعماري وتوزيع المسؤوليات (Architectural Hierarchy)

يتكون أي قسم أو صفحة إدارة في منصة **"شحنتك"** من 5 طبقات ملفات معيارية:

```text
app/admin/(pages)/{resource}/
└── page.tsx                      # 1. Server Component (SEO Metadata + Layout Wrapper)

components/admin/{resource}/
├── {Entities}.tsx                 # 2. Main Client Component (Stats, Search, Filter, Views, Table, Modal Controllers)
├── Add{Entity}.tsx               # 3. Add Modal Component (Zod Schema Validation & Create Mutation)
├── Edit{Entity}.tsx              # 4. Edit Modal Component (useEffect pre-fill, Zod Schema & Update Mutation)
└── Details{Entity}.tsx           # 5. Details Modal Component (Read-only view, Badges & Dates)
```

---

## 📐 2. القواعد واللوجيك البرمجي الخمس المعتمد (Core Execution Rules)

### 1️⃣ فحص البيانات المدخلة محلياً (Local Zod Validation)
* فحص المدخلات قبل إرسال طلب الشبكة باستخدام مخططات Zod المعتمدة في النظام ([`lib/validations/`](file:///e:/projects/shahntak/lib/validations)).
* تنظيف مصفوفة الأخطاء `setFieldErrors({})` فور إعادة التقديم.
* إبراز الحقول المعطوبة بحدود حمراء (`border-red-500`) مع عرض نص الخطأ العربي الصريح تحت المدخل مباشرة.

### 2️⃣ معالجة حالات التصفح والبحث (`setPage(1)`)
* في دوال تغيير نص البحث (`handleSearchChange`) أو تغيير الفلترة (`handleFilterStatusChange`), **يجب استدعاء `setPage(1)` دائماً** لمنع ظهور جداول فارغة للمستخدم في حالة كان يتصفح صفحات متأخرة.

### 3️⃣ تنظيف الكائن المختار فور الإغلاق (Cleanup Selected Item)
* عند إغلاق مودال التعديل أو التفاصيل، **يجب مسح الكائن المختار `setSelectedEntity(null)` فور الإغلاق** لمنع استعادة بيانات سابقة خاطئة عند فتح مودال لعنصر آخر.

### 4️⃣ الحماية من التكرار والنصوص الحركية في الأزرار (`disabled={isSubmitting}`)
* تجميد كافة عناصر الإدخال والأزرار بـ `disabled={isSubmitting}` أو `disabled={isPending}`.
* **التحميل الأولي**: استخدام مكون التحميل الموحد `<Loading />` من `@/components/ui/loading` فقط وحصراً عند التحميل الأولي للصفحة (`if (isLoading) return <Loading />;`).
* **ممنوع وضع `<Loading />` داخل أزرار التقديم**: يُستبدل النص داخل زر الحفظ بنص حركي صريح دون مكونات تحميل:
  - في مودال الإضافة: `{isSubmitting ? "جاري الإضافة..." : "حفظ البيانات"}`
  - في مودال التعديل: `{isSubmitting ? "جاري التعديل..." : "حفظ التعديلات"}`

### 5️⃣ التنبيه وتجديد الكاش اللحظي (Toast & Cache Invalidation)
* إظهار الرسائل الصريحة عبر `react-hot-toast`.
* إبطال الاستعلامات تلقائياً داخل `onSuccess` عبر `queryClient.invalidateQueries({ queryKey: resourceKeys.all })` لإعادة جلب البيانات وتحديث الواجهة مباشرة.

### 6️⃣ تمييز الحقول الإجبارية (`<span className="text-red-500">*</span>`)
* إدراج نجمة حمراء بارزة `<span className="text-red-500">*</span>` بجانب عنوان كل حقل إجباري مطابق للمخطط الزودي و Mongoose.

### 7️⃣ ضوابط وتسمية متغيرات النموذج (`formValues` vs `FormData`)
* **النماذج النصية العادية**: تُسمى حالة النموذج بـ `formValues` بدلاً من `formData` لمنع اللبس مع `new FormData()`.
* **الصور والملفات**: يُستخدم `new FormData()` حصراً وفقط في المكونات التي تتضمن رفع ملفات أو صور مستندات (`multipart/form-data`).

---

## 📋 3. دليل الخطوات لبناء أي صفحة جديدة (Step-by-Step Master Checklist)

اتبع هذه القائمة بالترتيب عند طلب بناء صفحة جديدة:

### 1. طبقة البيانات والـ Hooks:
- [ ] التأكد من وجود الواجهة الهيكلية (Interface) في [`types/data.ts`](file:///e:/projects/shahntak/types/data.ts).
- [ ] التأكد من وجود مخطط Zod في [`lib/validations/`](file:///e:/projects/shahntak/lib/validations).
- [ ] التأكد من وجود الـ Custom Hooks في [`hooks/[resource]/use[Resource].ts`](file:///e:/projects/shahntak/hooks).

### 2. صفحة السيرفر (`app/admin/(pages)/[resource]/page.tsx`):
- [ ] التأكد من كونها **Server Component** (بدون `"use client"`).
- [ ] تصدير كائن `metadata: Metadata` مع العنوان والتوصيف اللوجستي.
- [ ] استدعاء المكون الرئيسي `<[Resource]Section />` أو `<[Entities] />`.

### 3. المكون التفاعلي الرئيسي (`components/admin/[resource]/[Entities].tsx`):
- [ ] إضافة الموجّه `"use client"` في السطر الأول.
- [ ] إعداد حالات `page`, `limit`, `searchQuery`, `filterStatus`.
- [ ] إضافة زر التحديث وتدوير الأيقونة أثناء الجلب `isFetching`.
- [ ] إضافة كروت الإحصائيات `stats`.
- [ ] إضافة شريط البحث والفلترة مع استدعاء `setPage(1)`.
- [ ] استخدام `if (isLoading) return <Loading />;` للتحميل الأولي.
- [ ] رندر الجدول أو البطاقات مع حالات البيانات الفارغة `<EmptyData />`.
- [ ] ربط المودالات وتأكيد الحذف المؤقت عبر `<ConfirmDeletePopup />`.

### 4. مودال الإضافة (`Add[Entity].tsx`):
- [ ] ربط النموذج بـ Zod Schema الخاص بالإصدار الجديد (`[entity]CreateValidationSchema`).
- [ ] إضافة `<span className="text-red-500">*</span>` للحقول الإجبارية.
- [ ] إدراج التجميد والتعطيل `disabled={isSubmitting}` وتأطير الأخطاء باللون الأحمر.
- [ ] استخدام `<Loading w="w-4" h="h-4" />` داخل زر الحفظ وتمرير callback النجاح `onClose`.

### 5. مودال التعديل (`Edit[Entity].tsx`):
- [ ] تعبئة الحقول في `useEffect` عند تغيير الكائن المختار.
- [ ] ربط النموذج بـ Zod Schema الخاص بالتحديث (`update[Entity]ValidationSchema`).
- [ ] إضافة `<span className="text-red-500">*</span>` للحقول الإجبارية وإدارج `<Loading w="w-4" h="h-4" />` لزر التعديل.

### 6. مودال التفاصيل (`Details[Entity].tsx`):
- [ ] رندر البيانات بصيغة قراءة فقط (Read-only) مع Badges الحالة والتواريخ.

### 7. الفحص النهائي:
- [ ] تشغيل الفحص البنائي بـ `npx tsc --noEmit` للتحقق من خلو الكود من أي أخطاء.

---

## 📊 4. النماذج والأمثلة المرجعية المكتملة (Master Reference Codebases)

يمكنك دائماً الاعتماد على الموديلات والسكاشن المكتملة التالية كنموذج تطبيقي حي:

### 1️⃣ قسم موظفي الشركات والصلاحيات (`company-users`):
- صفحة السيرفر: [`app/admin/(pages)/company-users/page.tsx`](file:///e:/projects/shahntak/app/admin/%28pages%29/company-users/page.tsx)
- المكون الرئيسي: [`components/admin/company-users/CompanyUsers.tsx`](file:///e:/projects/shahntak/components/admin/company-users/CompanyUsers.tsx)
- مودال الإضافة: [`components/admin/company-users/AddCompanyUsers.tsx`](file:///e:/projects/shahntak/components/admin/company-users/AddCompanyUsers.tsx)
- مودال التعديل: [`components/admin/company-users/EditCompanyUsers.tsx`](file:///e:/projects/shahntak/components/admin/company-users/EditCompanyUsers.tsx)
- مودال التفاصيل: [`components/admin/company-users/DetailsCompanyUsers.tsx`](file:///e:/projects/shahntak/components/admin/company-users/DetailsCompanyUsers.tsx)

### 2️⃣ قسم الشركات المسجلة والمشتريات (`companies`):
- صفحة السيرفر: [`app/admin/(pages)/companies/page.tsx`](file:///e:/projects/shahntak/app/admin/%28pages%29/companies/page.tsx)
- المكون الرئيسي: [`components/admin/companies/Companies.tsx`](file:///e:/projects/shahntak/components/admin/companies/Companies.tsx)
- مودال الإضافة: [`components/admin/companies/AddCompanies.tsx`](file:///e:/projects/shahntak/components/admin/companies/AddCompanies.tsx)
- مودال التعديل: [`components/admin/companies/EditCompanies.tsx`](file:///e:/projects/shahntak/components/admin/companies/EditCompanies.tsx)
- مودال التفاصيل: [`components/admin/companies/DetailsCompanies.tsx`](file:///e:/projects/shahntak/components/admin/companies/DetailsCompanies.tsx)

### 3️⃣ قسم المستخدمين والمدراء (`users`):
- صفحة السيرفر: [`app/admin/(pages)/users/page.tsx`](file:///e:/projects/shahntak/app/admin/%28pages%29/users/page.tsx)
- المكون الرئيسي: [`components/admin/users/Users.tsx`](file:///e:/projects/shahntak/components/admin/users/Users.tsx)
- مودال الإضافة: [`components/admin/users/AddUsers.tsx`](file:///e:/projects/shahntak/components/admin/users/AddUsers.tsx)
- مودال التعديل: [`components/admin/users/EditUsers.tsx`](file:///e:/projects/shahntak/components/admin/users/EditUsers.tsx)
- مودال التفاصيل: [`components/admin/users/DetailsUsers.tsx`](file:///e:/projects/shahntak/components/admin/users/DetailsUsers.tsx)
