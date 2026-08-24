# 🎨 دليل وتصميم صفحات لوحة التحكم لمشروع "شحنتك" (Shahntak Admin Pages Design System & Style Guide)

هذا المستند هو المرجع الرئيسي والدائم لتصميم كافة صفحات ومكونات واجهات لوحة التحكم (**Admin Pages & Components Design Reference**). يحتوي على كافة القيم والأنماط التنسيقية للرموز والألوان والحدود والتأثيرات المستخدمة في المشروع.

---

## 🎨 1. ثيم الألوان والرموز المعتمدة (Design System Tokens)

تم تعريف الألوان والخطوط في [`app/globals.css`](file:///e:/projects/shahntak/app/globals.css) كالتالي:

| الرمز (Token Name) | الدرجة واللون (Hex Value) | الاستخدام والتطبيق |
| :--- | :--- | :--- |
| **`bg-heading` / `text-heading`** | `#1f1f1f` | لون العناوين الرئيسية والنصوص الداكنة والأزرار المغلقة الداكنة. |
| **`bg-body` / `text-body`** | `#5c6574` | النصوص الوصفية الفرعية، أيقونات البحث، والتفاصيل الثانوية. |
| **`bg-accent` / `text-accent`** | `#7444fd` | البنفسجي الزاهي المخصص للأزرار الرئيسية والتنبيهات التفاعلية وأشعة التمييز. |
| **`bg-accent-soft`** | `#efe9ff` | خلفية أيقونات وشعارات الكروت (`w-12 h-12 rounded-xl bg-accent-soft text-accent`). |
| **`bg-surface`** | `#ffffff` | خلفية البطاقات (Cards)، الجداول، والأسطح الرئيسية. |
| **`bg-surface-muted`** | `#f8f8f8` | خلفية الهيدر، الفوتر، حقول الإدخال، وخلفية الترقيم. |
| **`border-border`** | `#e0e0e0` | الحدود الموحدة الفاتحة (`border border-border`). |
| **`bg-success` / `text-success`** | `#70d715` | لون الحالات النشطة (`active`, `delivered`). |
| **`bg-success-soft`** | `#e6fbd4` | خلفية بادج الحالة النشطة (`bg-success-soft text-success`). |
| **`bg-warning` / `text-warning`** | `#f3ba0e` | لون التنبيهات وتجاوز الباقات (`quota_warning`, `pending`). |
| **`bg-warning-soft`** | `#fff4d9` | خلفية بادج التحذير (`bg-warning-soft text-warning`). |

---

## 📐 2. بنية الصفحة والهيدر الرئيسي (Page Header & Actions Layout)

تتكون كل صفحة لوحة تحكم من 3 أجزاء رئيسية:

```tsx
<div className="space-y-6">

    {/* 1. Page Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-extrabold text-heading">عنوان الصفحة الرئيسي</h1>
            <p className="text-sm text-body mt-0.5">الوصف واللوجيك التشغيلي للصفحة...</p>
        </div>

        <div className="flex items-center gap-3">
            {/* View Mode Toggle (Grid vs Table) */}
            <div className="bg-surface border border-border p-1 rounded-xl flex items-center gap-1">
                <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg text-xs font-bold transition-colors ${
                        viewMode === 'grid' ? 'bg-heading text-white' : 'text-body hover:text-heading'
                    }`}
                >
                    <LuLayoutGrid className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-lg text-xs font-bold transition-colors ${
                        viewMode === 'table' ? 'bg-heading text-white' : 'text-body hover:text-heading'
                    }`}
                >
                    <LuTable className="w-4 h-4" />
                </button>
            </div>

            {/* Primary Action Button */}
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all">
                <LuPlus className="w-4 h-4" />
                <span>إضافة جديد</span>
            </button>
        </div>
    </div>

    {/* 2. Filter & Search Bar */}
    <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-96">
            <LuSearch className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-body" />
            <input
                type="text"
                placeholder="بحث بالاسم أو المعرف..."
                className="w-full pl-4 pr-10 py-2 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
            />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-heading hover:bg-surface-muted transition-colors">
                <LuFilter className="w-3.5 h-3.5 text-body" />
                <span>التصفية: الكل</span>
            </button>
            <span className="text-xs font-bold text-body bg-surface-muted px-3 py-2 rounded-xl border border-border">
                إجمالي: {data.length} عنصر
            </span>
        </div>
    </div>

    {/* 3. Dynamic Content (Grid or Table View) */}
</div>
```

---

## 🗂️ 3. تصميم الكروت (Grid View Cards Spec)

عند اختيار نمط الكروت (`viewMode === 'grid'`):
* **حاوية الكارت**:
  ```tsx
  className="bg-surface rounded-2xl border border-border hover:border-accent/40 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
  ```
* **أيقونة الكارت الرئيسية (Avatar/Logo)**:
  ```tsx
  className="w-12 h-12 rounded-xl bg-accent-soft text-accent font-extrabold text-lg flex items-center justify-center shrink-0"
  ```
* **شريط نسبة الاستهلاك أو التقدم (Progress Bar)**:
  ```tsx
  <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden border border-border">
      <div
          className={`h-full rounded-full transition-all duration-500 ${
              quotaUsedPercent >= 90 ? 'bg-warning' : 'bg-accent'
          }`}
          style={{ width: `${quotaUsedPercent}%` }}
      />
  </div>
  ```
* **شبكة العدادات التشغيلية (Operations Counter Grid)**:
  ```tsx
  className="grid grid-cols-3 gap-2 py-2 border-y border-border text-center bg-surface-muted/30 rounded-xl p-2"
  ```
* **فوتر الكارت (Card Footer Actions)**:
  ```tsx
  className="px-5 py-3 bg-surface-muted border-t border-border flex items-center justify-between gap-3"
  ```

---

## 📊 4. تصميم الجداول (High-Density Table View Spec)

عند اختيار نمط الجدول (`viewMode === 'table'`):
* **حاوية الجدول**:
  ```tsx
  className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden"
  ```
* **رأس الجدول (`<thead>`)**:
  ```tsx
  className="bg-surface-muted/60 border-b border-border text-xs text-body font-bold"
  ```
* **صفوف الجدول (`<tbody> <tr>`)**:
  ```tsx
  className="hover:bg-surface-muted/30 transition-colors border-b border-border"
  ```
* **أزرار الإجراءات السريعة (Table Action Buttons)**:
  ```tsx
  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-heading hover:text-white text-xs font-bold transition-colors"
  ```

---

## 🏷️ 5. البادجات والحالات (Status Badges Standard)

```tsx
/* حالة نشطة (Active / Success) */
<span className="inline-flex items-center gap-1.5 font-bold text-success text-[11px] bg-success-soft px-2.5 py-0.5 rounded-full">
    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
    نشط
</span>

/* حالة تحذير أو تجاوز باقة (Warning / Pending) */
<span className="inline-flex items-center gap-1 font-bold text-warning text-[11px] bg-warning-soft px-2.5 py-0.5 rounded-full">
    <LuShieldAlert className="w-3 h-3" />
    تجاوز الباقة
</span>

/* حالة قيد المراجعة أو معطل (Inactive / Neutral) */
<span className="inline-flex items-center gap-1 font-bold text-body text-[11px] bg-surface-muted px-2.5 py-0.5 rounded-full border border-border">
    قيد المراجعة
</span>
```

---

## 🖼️ 6. المودالات ونوافذ الإدخال (Modals & Form Controls Specs)

* **حاوية المودال**: خلفية زجاجية أنيقة `bg-surface border border-border rounded-2xl shadow-xl`.
* **حقول الإدخال**: `w-full pl-4 pr-10 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent`.
* **زر الإرسال الرئيسي**: `bg-accent text-accent-foreground font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all`.

---

*هذا الملف هو المرجع الأساسي لتطبيق النمط البصري الموحد لكافة صفحة في لوحة تحكم شحنتك.*
