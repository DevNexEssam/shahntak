# 👥 توثيق مرحلة تنميط وتطوير قسم المستخدمين والمدراء (Users Section Standardization & Backend Integration)

> **الملخص**: يوثق هذا المستند مرحلة تطوير وتنميط قسم إدارة المستخدمين والمدراء (`components/admin/users/`) وتوصيل كافة الواجهات بـ **TanStack React Query v5** ومخططات **Zod Validation** وتطوير SEO Metadata في صفحة السيرفر.

---

## 🎯 1. أهداف المرحلة والمُنجزات
* **الربط البرمجي الكامل**: الاعتماد المباشر على ה-**Custom React Query Hooks** (`useUsers`, `useUser`, `useCreateUser`, `useUpdateUser`, `useDeleteUser`).
* **تطبيقات الدليل القياسي لسكاشن الأدمن**: النمذجة الموحدة وإدارة الحالات المحلية في المكونات الأربعة (`Users.tsx`, `AddUsers.tsx`, `EditUsers.tsx`, `DetailsUsers.tsx`).
* **تأمين الواجهة بـ SEO Metadata**: دعم عناوين الصفحات والتوصيف اللوجستي لـ Next.js App Router في صفحة السيرفر [`app/admin/(pages)/users/page.tsx`](file:///e:/projects/shahntak/app/admin/%28pages%29/users/page.tsx).

---

## 📐 2. القواعد واللوجيك المعماري المنفّذ (Architectural Rules)

### 1️⃣ فحص البيانات المدخلة (Local Zod Validation)
* فحص المدخلات محلياً باستخدام مخططات Zod المخصصة ([`lib/validations/user.schema.ts`](file:///e:/projects/shahntak/lib/validations/user.schema.ts)).
* تمرير أخطاء الفحص وإبراز الحقول المعطوبة باللون الأحمر مع عرض نصوص الأخطاء باللغة العربية تحت كل مدخل.

### 2️⃣ معالجة حالات التصفح والبحث (`setPage(1)`)
* عند تغيير نص البحث أو التبديل بين حالات الفلترة (`all`, `active`, `inactive`) يتم إعادة الضبط للصفحة الأولى تلقائياً `setPage(1)`.

### 3️⃣ تنظيف التحديد والمودال فور الإغلاق (Cleanup Selected Item)
* تفريغ المستخدم المختار `setSelectedUser(null)` فور إغلاق مودال التعديل أو التفاصيل لمنع تداخل البيانات عند التبديل بين المستعملين.

### 4️⃣ تجميد المدخلات ومؤشرات التحميل (`disabled={isPending}`)
* تجميد الحقول والأزرار وإظهار مؤشرات الدوران `<LuLoaderCircle className="animate-spin" />` أثناء إرسال طلبات الشبكة.

### 5️⃣ إدارة الكاش والـ Toast
* تنبيه المستخدم بالنتائج باستخدام `react-hot-toast` وتحديث الكاش تلقائياً بإلغاء المفاتيح `queryClient.invalidateQueries({ queryKey: userKeys.all })`.

---

## 📁 3. هيكل المكونات المنفّذة (Component Structure)

| المكون | المسار | الدور الوظيفي |
| :--- | :--- | :--- |
| **`Users.tsx`** | [`components/admin/users/Users.tsx`](file:///e:/projects/shahntak/components/admin/users/Users.tsx) | المكون الرئيسي التفاعلي (`"use client"`). يربط الـ Hooks والترقيم والفلترة والبحث وإحصائيات المستخدمين (`stats`). |
| **`AddUsers.tsx`** | [`components/admin/users/AddUsers.tsx`](file:///e:/projects/shahntak/components/admin/users/AddUsers.tsx) | مودال إنشاء حساب جديد مع Zod Schema و `useCreateUser` Mutation. |
| **`EditUsers.tsx`** | [`components/admin/users/EditUsers.tsx`](file:///e:/projects/shahntak/components/admin/users/EditUsers.tsx) | مودال تعديل بيانات الحساب وتعيين كلمة المرور الاختيارية ومربوط بـ `useUpdateUser` Mutation. |
| **`DetailsUsers.tsx`** | [`components/admin/users/DetailsUsers.tsx`](file:///e:/projects/shahntak/components/admin/users/DetailsUsers.tsx) | مودال استعراض التفاصيل الكاملة للمستخدم والصلاحيات والحالة بالدليل القياسي. |
| **`UsersPage`** | [`app/admin/(pages)/users/page.tsx`](file:///e:/projects/shahntak/app/admin/%28pages%29/users/page.tsx) | صفحة السيرفر (Server Component) مع إعداد عنوان الصفحة و SEO Metadata. |

---

## 🧪 4. الفحص واجتياز الاختبارات
- **TypeScript Compilation**: تم إجراء الفحص بنجاح بدون أي أخطاء (`npx tsc --noEmit`).
- **Data Integrity**: تطبيق معايير الأمان وتصفية المستخدمين النشطين غير المحذوفين.
