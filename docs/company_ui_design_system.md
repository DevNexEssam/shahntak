# دليل تصميم واجهات داشبورد الشركات (Company Dashboard UI Guidelines)

هذا المستند يوثّق النظام البصري والمعايير القياسية لشاشات ونوافذ لوحة تحكم الشركات (`company/dashboard/*`) في مشروع **شهنتك اللوجستية**.

---

## 🎨 فلسفة التصميم (Design Philosophy)

1. **الأسلوب المسطح والبسيط (Flat & Clean Design)**:
   - الابتعاد عن الألوان الفاقعة والظلال المبالغ فيها (`shadow-2xl` / `backdrop-blur-xl`).
   - استخدام حواف ناعمة موحدة (`rounded-md`).
   - الاعتماد على متغّيرات ألوان النظام (`bg-surface`, `bg-surface-muted`, `border-border`, `text-foreground`, `text-muted-foreground`).

2. **دعم اللغة العربية والخطوط (Typography & Direction)**:
   - اتجاه الصفحة والنوافذ: `dir="rtl"`.
   - النص العربي الرئيسي: `font-arabic`.
   - الأرقام، المبالغ المالية، التواريخ، والأكواد (IDs): `font-latin`.

---

## 📐 الهيكل القياسي لنوافذ التفاصيل المنبثقة (Details Modals)

تتبع جميع نوافذ التفاصيل (`DetailsCompanyInvoicePopup`, `DetailsCompanyShipmentPopup`, `DetailsCompanyOrderPopup`) الهيكل البصري التالي:

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-150" dir="rtl">
    <div className="printable-area w-full max-w-xl bg-surface border border-border rounded-md shadow-xs overflow-hidden flex flex-col">

        {/* 1. Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-surface">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-foreground">عنوان التفاصيل</h2>
                        {/* Status Badge */}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 font-latin">رقم العنصر: <span className="font-semibold text-accent">#ID</span></p>
                </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-surface-muted text-muted-foreground hover:text-foreground">
                <LuX className="w-5 h-5" />
            </button>
        </div>

        {/* 2. Body Content */}
        <div className="p-5 space-y-4">
            {/* Summary Row */}
            <div className="p-4 rounded-md bg-surface-muted border border-border flex items-center justify-between text-xs">
                ...
            </div>

            {/* Info Cards */}
            <div className="p-4 rounded-md border border-border bg-surface space-y-3">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                    <Icon className="w-4 h-4 text-accent" />
                    <span>عنوان القسم</span>
                </h3>
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-border">
                        <span className="text-muted-foreground">اسم الحقل</span>
                        <span className="font-semibold text-foreground">القيمة</span>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. Footer */}
        <div className="p-4 border-t border-border bg-surface-muted flex justify-end">
            <button onClick={onClose} className="px-4 py-1.5 text-xs font-semibold rounded-md border border-border bg-surface hover:bg-border/20 text-foreground">
                إغلاق
            </button>
        </div>

    </div>
</div>
```

---

## 🏷️ معايير شارات الحالات باللغة العربية (Status Badges Standard)

جميع الحالات تظهر باللغة العربية حصراً بنمط تصميمي هادئ وموحد:

### 1. حالات الطلبات (`company/dashboard/orders`)
| رمز الحالة | النص العربي | النمط (Tailwind Classes) |
| :--- | :--- | :--- |
| `pending` | **قيد الانتظار** | `px-2.5 py-1 text-xs font-semibold rounded bg-amber-500/10 text-amber-600` |
| `validated` | **مؤكد** | `px-2.5 py-1 text-xs font-semibold rounded bg-indigo-500/10 text-indigo-600` |
| `grouped` | **مجمع بشحنة** | `px-2.5 py-1 text-xs font-semibold rounded bg-purple-500/10 text-purple-600` |
| `shipped` | **تم الشحن** | `px-2.5 py-1 text-xs font-semibold rounded bg-sky-500/10 text-sky-600` |
| `delivered` | **تم التوصيل** | `px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-600` |
| `cancelled` | **ملغي** | `px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600` |
| `error` | **خطأ في البيانات** | `px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600` |

### 2. حالات الشحنات (`company/dashboard/shipments`)
| رمز الحالة | النص العربي | النمط (Tailwind Classes) |
| :--- | :--- | :--- |
| `created` | **حديثة** | `px-2.5 py-1 text-xs font-semibold rounded bg-amber-500/10 text-amber-600` |
| `confirmed` | **مؤكدة** | `px-2.5 py-1 text-xs font-semibold rounded bg-indigo-500/10 text-indigo-600` |
| `assigned` | **معينة لناقل** | `px-2.5 py-1 text-xs font-semibold rounded bg-blue-500/10 text-blue-600` |
| `ready_for_pickup` | **جاهزة للاستلام** | `px-2.5 py-1 text-xs font-semibold rounded bg-purple-500/10 text-purple-600` |
| `picked_up` | **تم الاستلام** | `px-2.5 py-1 text-xs font-semibold rounded bg-teal-500/10 text-teal-600` |
| `in_transit` | **في الطريق** | `px-2.5 py-1 text-xs font-semibold rounded bg-sky-500/10 text-sky-600` |
| `arrived` | **وصلت للمركز** | `px-2.5 py-1 text-xs font-semibold rounded bg-cyan-500/10 text-cyan-600` |
| `out_for_delivery` | **خرجت للتوصيل** | `px-2.5 py-1 text-xs font-semibold rounded bg-orange-500/10 text-orange-600` |
| `delivered` | **تم التوصيل** | `px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-600` |
| `delivery_failed` | **فشل التوصيل** | `px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600` |
| `cancelled` | **ملغية** | `px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600` |
| `returned` | **مرتجعة** | `px-2.5 py-1 text-xs font-semibold rounded bg-gray-500/10 text-gray-600` |
| `exception` | **حالة استثنائية** | `px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600` |

### 3. حالات الفواتير (`company/dashboard/invoices`)
| رمز الحالة | النص العربي | النمط (Tailwind Classes) |
| :--- | :--- | :--- |
| `paid` | **مسدد ومحصل** | `px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-600` |
| `issued` | **صادرة ومعلقة** | `px-2.5 py-1 text-xs font-semibold rounded bg-accent/10 text-accent` |
| `overdue` | **متأخرة السداد** | `px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600` |
| `draft` | **مسودة** | `px-2.5 py-1 text-xs font-semibold rounded bg-surface-muted text-muted-foreground` |

### 4. حالات وأدوار الموظفين (`company/dashboard/employees`)
| العنصر | النص العربي | النمط (Tailwind Classes) |
| :--- | :--- | :--- |
| `active` | **نشط ومفعل** | `px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-600` |
| `inactive` | **مجمد** | `px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600` |
| `owner` | **مالك الشركة** | `px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-500/10 text-purple-600` |
| `manager` | **مدير تشغيل** | `px-2.5 py-0.5 rounded-md text-xs font-bold bg-accent-soft text-accent` |
| `staff` | **موظف** | `px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-500/10 text-slate-600` |

### 5. حالات وتأطير المركبات (`company/dashboard/vehicles`)
| العنصر | النص العربي | النمط (Tailwind Classes) |
| :--- | :--- | :--- |
| `active` | **نشطة ومفعلة** | `px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-600` |
| `inactive` | **متوقفة** | `px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600` |

---

## 🖨️ قواعد طباعة الفواتير والبوالص (Print Styles)

عند طباعة الفواتير والبوالص يتم إخفاء أزرار الإغلاق والشريط الجانبي والأزرار ذات الكلاس `.no-print` أو التسمية العامة `button` تلقائياً عبر نمط `@media print` المعرّف في `globals.css`:

```css
@media print {
  header, aside, nav, button, .no-print {
    display: none !important;
  }
  body, html {
    background: #ffffff !important;
    color: #000000 !important;
    overflow: visible !important;
  }
}
```

---

## 📁 المكونات ذات الصلة (Related Components)

- [DetailsCompanyInvoicePopup.tsx](file:///e:/projects/shahntak/components/company/invoices/DetailsCompanyInvoicePopup.tsx)
- [DetailsCompanyShipmentPopup.tsx](file:///e:/projects/shahntak/components/company/shipments/DetailsCompanyShipmentPopup.tsx)
- [DetailsCompanyOrderPopup.tsx](file:///e:/projects/shahntak/components/company/orders/DetailsCompanyOrderPopup.tsx)
- [DetailsCompanyEmployeePopup.tsx](file:///e:/projects/shahntak/components/company/employees/DetailsCompanyEmployeePopup.tsx)
- [DetailsCompanyVehiclePopup.tsx](file:///e:/projects/shahntak/components/company/vehicles/DetailsCompanyVehiclePopup.tsx)
- [CompanyOrders.tsx](file:///e:/projects/shahntak/components/company/orders/CompanyOrders.tsx)
- [CompanyShipments.tsx](file:///e:/projects/shahntak/components/company/shipments/CompanyShipments.tsx)
- [CompanyInvoices.tsx](file:///e:/projects/shahntak/components/company/invoices/CompanyInvoices.tsx)
- [CompanyEmployees.tsx](file:///e:/projects/shahntak/components/company/employees/CompanyEmployees.tsx)
- [CompanyVehicles.tsx](file:///e:/projects/shahntak/components/company/vehicles/CompanyVehicles.tsx)
