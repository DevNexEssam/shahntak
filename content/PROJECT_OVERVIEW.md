# 📦 دليل التوثيق والمهندسة المعمارية لمشروع "شحنتك" (Shahntak)

> **ملاحظة**: هذا الملف هو المرجع الأساسي لمساعد AI وللمطورين لفهم بنية مشروع **شحنتك** بالكامل، تقنياته، نماذج بياناته، وهيكل صفحاته.

---

## 🎯 1. نظرة عامة على المشروع (Project Overview)
**"شحنتك" (Shahntak)** هي منصة سحابية متعددة الشركات (**B2B SaaS Platform**) مخصصة لإدارة العمليات اللوجستية، النقل، والشحن في المملكة العربية السعودية والمنطقة.

تتيح المنصة لشركات الشحن والشركاء اللوجستيين:
* إدارة طلبات الشحن وتحويلها إلى شحنات مجمعة (FTL / LTL / التوصيل المحلي).
* إدارة الأساطيل، الشاحنات، المركبات، والناقلين المتعاقدين.
* تتبع الشحنات لحظياً وتسجيل خط السير والأحداث.
* إصدار الفواتير اللوجستية وبوالص الشحن (Waybills) بصيغة PDF.
* إدارة اشتراكات الشركات وعرض تقارير وإحصائيات متقدمة عبر لوحة تحكم الأدمن (Super Admin).

---

## 🛠️ 2. التكنولوجيا والتقنيات المستخدمة (Tech Stack)

### Core Framework & Runtime
* **Framework**: [Next.js 16.3.1](file:///e:/projects/shahntak/package.json#L23) (App Router)
* **Library**: [React 19.2.8](file:///e:/projects/shahntak/package.json#L25)
* **Language**: TypeScript 5

### Database & Authentication
* **Database**: MongoDB
* **ORM / ODM**: [Mongoose 9.9.3](file:///e:/projects/shahntak/package.json#L22) + [MongoDB Driver 7.5.0](file:///e:/projects/shahntak/package.json#L21)
* **DB Connection**: [lib/mongodb.ts](file:///e:/projects/shahntak/lib/mongodb.ts)
* **Authentication**: [NextAuth.js 4.24.15](file:///e:/projects/shahntak/lib/authOptions.ts) (Credentials Provider + JWT + Bcryptjs)

### UI & Styling
* **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`)
* **Icons**: `react-icons` (`react-icons/lu`, `react-icons/fa6`)
* **Direction**: Right-to-Left (`dir="rtl"`) للغة العربية.

### Forms, Validation & Utilities
* **Forms & Validation**: [React Hook Form](file:///e:/projects/shahntak/package.json#L27) + [Zod 4.4.3](file:///e:/projects/shahntak/package.json#L33)
* **Validation Schemas**: [`lib/validations`](file:///e:/projects/shahntak/lib/validations) (تشمل 13 مخطط Zod لكافة نماذج قاعدة البيانات)
* **PDF Generation**: `@react-pdf/renderer` v4.6.1 (لإنشاء الفواتير وبوالص الشحن)
* **Data Fetching**: `@tanstack/react-query` v5 + `axios`
* **Media Upload**: `cloudinary`

---

## 🗄️ 3. نماذج البيانات وبنية قاعدة البيانات (Database Schemas & Models)

تقع جميع نماذج Mongoose في مجلد [`/models`](file:///e:/projects/shahntak/models):

| النموذج (Model) | الملف | الوصف والعلاقات |
| :--- | :--- | :--- |
| **`Company`** | [companies.ts](file:///e:/projects/shahntak/models/companies.ts) | نموذج شركة الشحن المشتركة (اسم الشركة، البريد، الرقم الضريبي، المدينة، الحالة). يحتوي على virtual refs للشحنات، الطلبات، الموظفين، والفواتير. |
| **`CompanyUser`** | [Companyuser.ts](file:///e:/projects/shahntak/models/Companyuser.ts) | موظفو ومستخدمو الشركات المضافة. |
| **`User`** | [user.ts](file:///e:/projects/shahntak/models/user.ts) | مستخدمو النظام الخارجيون / Super Admin للتحكم بالمنصة. |
| **`Order`** | [order.ts](file:///e:/projects/shahntak/models/order.ts) | الطلب الفردي المنشأ بواسطة الشركة (بيانات المستلم، المدينة، الوزن، القيمة، COD، الحالة). |
| **`Shipment`** | [shipment.ts](file:///e:/projects/shahntak/models/shipment.ts) | الشحنة الرئيسية (تجمع مجموعة طلبات). تشمل النوع (`ftl`, `ltl`, `local_delivery`)، المسار، الناقل، المركبة، والحالة. |
| **`Carrier`** | [carrier.ts](file:///e:/projects/shahntak/models/carrier.ts) | الناقلون وشركات النقل المتعاقد معها. |
| **`Vehicle`** | [vehicle.ts](file:///e:/projects/shahntak/models/vehicle.ts) | مركبات الأسطول والشاحنات. |
| **`Route`** | [route.ts](file:///e:/projects/shahntak/models/route.ts) | المسارات والخطوط اللوجستية بين المناطق والمدن. |
| **`Waybill`** | [waybill.ts](file:///e:/projects/shahntak/models/waybill.ts) | بوليصة الشحن الرسمية المرفقة مع كل شحنة. |
| **`Invoice`** | [invoice.ts](file:///e:/projects/shahntak/models/invoice.ts) | الفواتير المالية الصادرة للشركات أو العمليات. |
| **`Payment`** | [payment.ts](file:///e:/projects/shahntak/models/payment.ts) | عمليات الدفع والسداد. |
| **`TrackingEvent`** | [trackingevent.ts](file:///e:/projects/shahntak/models/trackingevent.ts) | سجل تحديثات وتتبع حركة الشحنة لحظة بلحظة. |
| **`Notification`** | [notification.ts](file:///e:/projects/shahntak/models/notification.ts) | التنبيهات والإشعارات بالنظام. |

---

## 📁 4. هيكل المجلدات والصفحات (Directory & Route Structure)

```text
shahntak/
├── app/                        # Next.js App Router Pages
│   ├── admin/                  # لوحة تحكم السوبر أدمن
│   │   ├── (pages)/            # الصفحات الفرعية للإدارة
│   │   │   ├── companies/      # إدارة الشركات المسجلة والمشتريات
│   │   │   ├── invoices/       # الفواتير وبوالص الشحن
│   │   │   ├── orders/         # الطلبات والشحنات
│   │   │   ├── reports/        # التقارير والإحصائيات
│   │   │   ├── routes/         # المسارات والأسطول
│   │   │   └── settings/       # إعدادات المنصة
│   │   ├── layout.tsx          # تخطيط لوحة التحكم (Sidebar + Header)
│   │   └── page.tsx            # مركز العمليات الرئيسي (Main Dashboard)
│   ├── globals.css             # التنسيقات العامة والمشتركة
│   ├── layout.tsx              # Root Layout
│   └── page.tsx                # الصفحة الرئيسية العامة (Landing Page)
│
├── components/                 # مكونات الواجهة (React Components)
│   ├── admin/                  # مكونات لوحة التحكم
│   │   └── layout/             # AdminHeader & AdminSidebar
│   ├── home/                   # مكونات الصفحة الرئيسية (Hero, Features, Pricing, etc.)
│   └── ui/                     # مكونات واجهة المستخدم العامة
│
├── hooks/                      # طبقة الـ Custom React Query Hooks (مقسمة بمجلدات لكل موديل)
│   └── users/                  # useUsers.ts
├── lib/                        # الأدوات المساعدة والإعدادات
│   ├── authOptions.ts          # إعدادات وتكوين NextAuth
│   ├── mongodb.ts              # الاتصال بقاعدة بيانات MongoDB
│   └── validations/            # المخططات التحققية (Zod Schemas)
│       └── companies.schema.ts
│
├── models/                     # نماذج قواعد البيانات (Mongoose Models)
├── services/                   # طبقة خدمات الربط واستدعاءات الـ API (Axios API Clients)
│   ├── carriers/               # carrierServices.ts
│   ├── companies/              # companyServices.ts
│   ├── companyUsers/           # companyUserServices.ts
│   ├── invoices/               # invoiceServices.ts
│   ├── notifications/          # notificationServices.ts
│   ├── orders/                 # orderServices.ts
│   ├── payments/               # paymentServices.ts
│   ├── routes/                 # routeServices.ts
│   ├── shipments/              # shipmentServices.ts
│   ├── trackingEvents/         # trackingEventServices.ts
│   ├── users/                  # userServices.ts
│   ├── vehicles/               # vehicleServices.ts
│   └── waybills/               # waybillServices.ts
├── types/                      # تعريفات TypeScript العامة
│   └── data.ts                 # تعريفات الكائنات واستجابات الـ API (User, Carrier...)
└── package.json                # التبعيات وأوامر التشغيل
```

---

## 🔑 5. أهم ملفات النظام ومساراتها

* **أنواع واستجابات البيانات**: [`types/data.ts`](file:///e:/projects/shahntak/types/data.ts)
* **خدمات الربط واستدعاءات الباك إند**: مجلد [`/services`](file:///e:/projects/shahntak/services) (يشمل 13 خدمة موحدة لكافة نماذج قاعدة البيانات)
* **طبقة الـ Custom React Query Hooks**: مجلد [`/hooks`](file:///e:/projects/shahntak/hooks) (يشمل المجلدات والـ Hooks المخصصة كـ [`hooks/users/useUsers.ts`](file:///e:/projects/shahntak/hooks/users/useUsers.ts))
* **خريطة الطريق والتقدم التنفيذي**: [`content/ROADMAP.md`](file:///e:/projects/shahntak/content/ROADMAP.md)
* **إعدادات المصادقة**: [`lib/authOptions.ts`](file:///e:/projects/shahntak/lib/authOptions.ts)

* **معايير وهندسة الـ APIs والباك إند**: [`BACKEND_CONVENTIONS.md`](file:///e:/projects/shahntak/content/BACKEND_CONVENTIONS.md)



* **الاتصال بقاعدة البيانات**: [`lib/mongodb.ts`](file:///e:/projects/shahntak/lib/mongodb.ts)
* **الصفحة الرئيسية للموقع**: [`app/page.tsx`](file:///e:/projects/shahntak/app/page.tsx)
* **لوحة تحكم السوبر أدمن**: [`app/admin/page.tsx`](file:///e:/projects/shahntak/app/admin/page.tsx)
* **الشريط الجانبي للأدمن**: [`components/admin/layout/AdminSidebar.tsx`](file:///e:/projects/shahntak/components/admin/layout/AdminSidebar.tsx)
* **الهيدر للأدمن**: [`components/admin/layout/AdminHeader.tsx`](file:///e:/projects/shahntak/components/admin/layout/AdminHeader.tsx)

---

## 🚀 6. تشغيل المشروع والتطوير (Development Workflow)

```bash
# تشغيل خادم التطوير
npm run dev

# بناء النسخة الإنتاجية
npm run build

# تشغيل النسخة الإنتاجية المبنية
npm run start

# فحص الأخطاء والتنسيق
npm run lint
```

---

## 🛡️ 7. معايير سلامة المراجع والقيود الهيكلية (Strict Referential Integrity Rules)

* **التحقق المزدوج عند الإنشاء والتعديل (`POST` & `PATCH`)**:
  جميع المعرفات المرجعية الربطية (`companyId`, `createdByUserId`, `shipmentId`, `carrierId`, `vehicleId`, `routeId`, `approvedBy`, `invoiceId`, `recipientId`) خاضعة لفحصين إلزاميين في جميع الواجهات:
  1. **التحقق من صحة التركيب الهيكلي**: فحص `mongoose.Types.ObjectId.isValid(id)`.
  2. **التحقق من الوجود الساري بقاعدة البيانات**: التأكد من وجود الكيان فعلياً ودون حذف مؤقت `...ACTIVE` قبل السماح بإتمام الحفظ أو التعديل.
  3. **رسائل خطأ Zod للحقول الإجبارية**: تمرير رسالة الخطأ العربية الصريحة (`z.string("اسم الحقل مطلوب")`) لكل حقل إجباري يطابق `required: true` في Mongoose.
