# 🎨 دليل تصميم مكونات لوحة التحكم (Admin UI Design System)

هذا المستند المرجعي يضم جميع تصاميم المكونات (UI Components) الرسمية المعتمدة في لوحة تحكم منصة **شحنتك**، متضمنةً كود Tailwind CSS والأنماط الدقيقة كالألوان والحدود (Borders) والظلال (Shadows) والتقوسات (Border Radius).

---

## ⚠️ ⚡ القواعد الذهبية لتصاميم الجدول والإحصائيات والأزرار (Core Design Rules)

1. **الجدول الرئيسي وشريط الفلترة (Table & Filter Bar Container)**:
   - **التقوس المعياري**: `rounded-md` (6px) لحاوية الجدول وحاوية الفلاتر والبحث.
   - **الظلال (Shadows)**: **ممنوع استخدام الظلال (No Shadows)** كـ `shadow-xs` أو `shadow-md` على الجداول وشريط البحث والفلاتر (فقط `border border-border`).

2. **أزرار الفلترة والتحكم (Filter Buttons)**:
   - **التقوس المعياري للأزرار**: `rounded-md` (6px) لجميع أزرار التصفية، أزرار التحكم، أزرار التبديل، وأزرار الإجراءات داخل الجدول.

3. **كروت الإحصائيات (KPI / Stats Cards)**:
   - **التصميم القياسي الموحد المطابق لـ `Companies.tsx`**:
     ```tsx
     <div className="border border-border rounded-sm p-5 bg-surface">
         <div className="flex items-center justify-between gap-4">
             <div>
                 <span className="text-xs font-semibold text-body block mb-1">عنوان الكرت</span>
                 <h3 className="text-2xl font-bold text-heading my-1">١٢٣</h3>
                 <p className="text-xs text-body flex items-center gap-1 mt-2">
                     <span>الوصف الفرعي</span>
                 </p>
             </div>
             <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                 <LuIcon className="w-5 h-5" />
             </div>
         </div>
     </div>
     ```
   - **صندوق الأيقونة**: دائري `w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center` مع أيقونة بحجم `w-5 h-5`.
   - **الحاوية**: `border border-border rounded-sm p-5 bg-surface`.

4. **تطابق نموذج التعديل لنموذج الإضافة (Identical Edit & Add Form Styles)**:
   - نموذج التعديل (`Edit[Entity].tsx`) يتبع **نفس الستايل، الألوان، الأيقونات بالهيدر (`bg-accent-soft text-accent`)، ألوان العناوين الفرعية (`text-accent`)، وزر الإرسال الأساسي (`bg-accent text-accent-foreground rounded-md`)** مثل نموذج الإضافة تماماً لتوحيد تجربة المستخدم البصرية.

---

## 📌 1. رأس الصفحة والعنوان الرئيسي (Page Title & Status Badges)

### 📸 كود المكون (React / Tailwind CSS):
```tsx
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
        <h1 className="text-2xl font-extrabold text-heading">مركز العمليات الرئيسي</h1>
        <p className="text-sm text-body mt-1">نظرة عامة لحظية على أداء جميع شركات الشحن المسجلة على منصة شحنتك.</p>
    </div>
    <div className="flex items-center gap-2">
        {/* Badge 1: آخر تحديث / حالة النظام */}
        <span className="text-xs font-semibold text-body bg-surface px-3 py-1.5 rounded-md border border-border">
            آخر تحديث: قبل دقيقة واحدة
        </span>
    </div>
</div>
```

---

## 📊 2. تصميم كرت الإحصائيات المعتمد (KPI / Stats Card)

### 📸 كود المكون القياسي المطابق لـ `Companies.tsx`:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div className="border border-border rounded-sm p-5 bg-surface">
        <div className="flex items-center justify-between gap-4">
            <div>
                <span className="text-xs font-semibold text-body block mb-1">إجمالي الشركات</span>
                <h3 className="text-2xl font-bold text-heading my-1">{stats.total}</h3>
                <p className="text-xs text-body flex items-center gap-1 mt-2">
                    <span>المسجلة في المنصة</span>
                </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                <LuBuilding2 className="w-5 h-5" />
            </div>
        </div>
    </div>
</div>
```

---

## 🔍 3. شريط البحث والفلاتر بدون ظلال (Search & Filter Bar)

### 📸 كود المكون (React / Tailwind CSS):
```tsx
<div className="bg-surface p-4 rounded-md border border-border flex flex-col md:flex-row gap-4 items-center justify-between">
    {/* Input Box */}
    <div className="relative w-full md:w-96">
        <LuSearch className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-body" />
        <input
            type="text"
            placeholder="البحث باسم الشركة..."
            className="w-full pr-10 pl-4 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
        />
    </div>

    {/* Filter Buttons */}
    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
        <button className="px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer bg-accent text-accent-foreground">
            الكل
        </button>
        <button className="px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer bg-surface-muted text-body border border-border hover:text-heading">
            النشطة
        </button>
    </div>
</div>
```

---

## 🏢 4. جدول البيانات الرئيسي بدون ظلال (Standard Data Table Container)

### 📸 كود المكون (React / Tailwind CSS):
```tsx
<div className="bg-surface rounded-md border border-border overflow-hidden">
    <div className="overflow-x-auto">
        <table className="w-full text-right text-sm border-collapse">
            <thead className="bg-surface-muted/60 border-b border-border text-xs text-body font-bold">
                <tr>
                    <th className="py-3.5 px-4">اسم الشركة</th>
                    <th className="py-3.5 px-4">المدينة</th>
                    <th className="py-3.5 px-4">الحالة</th>
                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border">
                <tr className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-heading">شركة الرياض السريع</td>
                    <td className="py-3.5 px-4 text-body">الرياض</td>
                    <td className="py-3.5 px-4">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                            نشط
                        </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                            <button className="p-2 rounded-md bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer">
                                <LuEye className="w-4 h-4" />
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
```

---

## 📐 5. دليل المسافات والـ Padding القياسي المعتمد (Standard Spacing & Padding Tokens)

جميع المسافات والـ Padding مستخرجة 100% من كود `Companies.tsx` ومطابقة تماماً لكل صفحات لوحة التحكم:

1. **مسافة الحاوية الرئيسية لجميع الأقسام (Main Page Container Spacing)**:
   - `space-y-6 text-right font-arabic` (تباعد عمودي 24px بين هيدر الصفحة، الكروت، الفلاتر، والجدول).

2. **كرت الإحصائيات (KPI Cards Padding)**:
   - `p-5` (20px دائم لجميع الجوانب) مع تباعد عناصر `gap-4`.

3. **شريط الفلترة والبحث (Search & Filter Bar Padding)**:
   - `p-4` (16px دائم لجميع الجوانب) مع تباعد أفقي `gap-4`.

4. **خلايا الجدول الرئيسي (Data Table Cell Padding)**:
   - عناوين ورؤوس الجدول (TH): `py-3.5 px-4` (14px عمودي، 16px أفقي).
   - صفوف وخلايا الجدول (TD): `py-3.5 px-4` (14px عمودي، 16px أفقي).

5. **بطاقات العرض الشبكي (Grid Cards Padding)**:
   - جسم البطاقة (Body): `p-5 space-y-4` (20px حشو داخلي مع تباعد 16px).
   - فوتر البطاقة (Footer): `p-4 border-t border-border bg-surface-muted/40`.

6. **المودالات والنوافذ المنبثقة (Modal Padding Specs)**:
   - هيدر المودال (Header): `p-6 border-b border-border bg-surface-muted/50`.
   - جسم المودال (Form Body): `p-6 overflow-y-auto space-y-6`.
   - فوتر المودال (Footer): `p-5 border-t border-border bg-surface-muted/40`.
   - حشو زر الإرسال الرئيسي (Submit Button): `px-6 py-2.5 rounded-md`.
   - حشو زر الإلغاء (Cancel Button): `px-5 py-2.5 rounded-md`.

---

*تم التحديث بنجاح واعتماد جميع المسافات والـ Padding و`rounded-md` بدون ظلال للجداول والفلاتر من `Companies.tsx`.*
