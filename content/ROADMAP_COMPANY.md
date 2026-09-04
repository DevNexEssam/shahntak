# 🗺️ خريطة الطريق ودليل المعمارية لبناء سيستم الشركة المشتركة (Company Portal Roadmap & Architecture)

> **ملاحظة**: هذا الملف هو المرجع الأساسي الموحد الشامل لخريطة طريق ومعمارية **سيستم ولوحة تحكم الشركة المشتركة (Company Portal System)** في منصة **"شحنتك" (Shahntak)**، يجمع بين البنية البرمجية لعزل المستأجرين (Multi-Tenant SaaS Architecture)، الكود المرجعي، بنية الملفات، وخطة بناء الأقسام الستة.

---

## 📌 🎯 حالة سيستم بوابة الشركة (Company Portal Status)

> [!IMPORTANT]
> **إنجاز مكتمل بالكامل 100%**:
> * **تم بناء وتنميط واجهات البوابة الـ 8 بالكامل ورابطها بالـ Hooks والـ APIs المعزولة**:
>   1. 📊 **الداشبورد الرئيسية** (`dashboard`)
>   2. 📦 **قسم الطلبات والتجميع** (`orders`)
>   3. 🚚 **قسم الشحنات وطباعة البوالص** (`shipments`)
>   4. 🧾 **قسم الفواتير والفوترة الضريبية** (`invoices`)
>   5. 👥 **قسم الموظفين وفريق العمل** (`employees`)
>   6. 🚛 **قسم الأسطول والمركبات** (`vehicles`)
>   7. 📈 **قسم التقارير والإحصائيات المبوبة** (`reports`)
>   8. ⚙️ **قسم إعدادات الشركة والاشتراك** (`settings`)

---

## ✅ حالة إنجاز المراحل (Phases Completion Status)

* ✅ **المرحلة الأولى: التأسيس التقني المعزول وبنية الخدمات وبك-إند الشركة بالكامل (100%)**:
  * **تطوير مسارات الـ Backend المعزولة بـ `companyId`**:
    - **الموظفين (`CompanyUser`)**: `GET`, `POST /new`, `GET/PUT/DELETE /[id]`.
    - **المركبات (`Vehicle`)**: `GET`, `POST /new`, `GET/PUT/DELETE /[id]`.
    - **الطلبات (`Orders`)**: `GET`, `POST /new`, `GET/PUT/DELETE /[id]`.
    - **الشحنات (`Shipments`)**: `GET`, `POST /new`, `GET/PUT/DELETE /[id]`.
    - **الفواتير (`Invoices`)**: `GET`, `POST /new`, `GET/PUT/DELETE /[id]`.
    - **التقارير والإحصائيات (`Reports`)**: `GET /api/company/reports`.
  * تشمل التأسيس التقني والأنواع وحماية `withCompanyGuard` و `checkSubscriptionQuota` مع خلو الكود من الإيموجيات وتأكيد السلامة بـ `npx tsc --noEmit` بنسبة 100%.
* ✅ **المرحلة الثانية: التخطيط والهيكل الرئيسي لبوابة الشركة (Company Portal Layout) (100%)**:
  * إنشاء مكون الشريط الجانبي `CompanySidebar.tsx` بتصميم مطابق لـ `AdminSidebar`.
  * إنشاء مكون الهيدر العلوي `CompanyHeader.tsx` بتصميم مطابق لـ `AdminHeader`.
  * إنشاء التخطيط الشامل `CompanyClientLayout.tsx` وتجميع لوحة التحكم `app/company/dashboard/layout.tsx`.
* ✅ **المرحلة الثالثة: بناء وتنميط واجهات بوابة الشركة (مكتملة بالكامل 100% - 8 أقسام من أصل 8)**:
  * ✅ **الداشبورد الرئيسية للشركة** (`dashboard`): `CompanyDashboard.tsx` واللوحة الإحصائية الحية.
  * ✅ **قسم الطلبات** (`orders`): `CompanyOrders.tsx` ونماذج الإضافة والتعديل والتفاصيل والتجميع.
  * ✅ **قسم الشحنات وتعيين الموارد** (`shipments`): `CompanyShipments.tsx` ونماذج التفاصيل والتتبع وطباعة البولص 🖨️.
  * ✅ **قسم البوالص والفواتير المالية** (`invoices`): `CompanyInvoices.tsx` والتفاصيل المالية وطباعة الفاتورة الضريبية.
  * ✅ **قسم فريق العمل والموظفين** (`employees`): `CompanyEmployees.tsx` ونماذج الإضافة والتعديل والتفاصيل والأدوار.
  * ✅ **قسم الأسطول والمركبات** (`vehicles`): `CompanyVehicles.tsx` ونماذج الإضافة والتعديل والتفاصيل.
  * ✅ **قسم التقارير والإحصائيات المبوبة** (`reports`): `CompanyReports.tsx` والتبويبات الأربعة المعزولة الأداء.
  * ✅ **قسم إعدادات الشركة والاشتراك** (`settings`): `CompanySettings.tsx` وإدارة ملف الشركة ومتابعة حدود الباقة.


---

## 🎯 1. نظرة عامة والأهداف المعمارية

سيستم الشركة المشتركة هو البوابة المخصصة لشركات الشحن والشركاء اللوجستيين المستأجرين (Tenants) لإدارة عملياتهم اليومية المستقلة:
* **العزل التام للبيانات (Strict Data Isolation)**: عزل استعلامات وقواعد بيانات كل شركة حصرياً بناءً على `session.user.companyId`.
* **أتمتة فحص الصلاحيات والحصص (Quota & Subscription Enforcement)**: ربط عمليات الإضافة والتعديل تلقائياً بالباقة السحابية النشطة للشركة والحدود الشهرية المسموحة.
* **التوافق البصري التام (Design System Alignment)**: تطبيق المعايير الدقيقة المعتمدة في [`content/ADMIN_UI_DESIGN_SYSTEM.md`](file:///e:/projects/shahntak/content/ADMIN_UI_DESIGN_SYSTEM.md) و [`content/ADMIN_SECTIONS_STANDARDIZED_GUIDE.md`](file:///e:/projects/shahntak/content/ADMIN_SECTIONS_STANDARDIZED_GUIDE.md).

---

## 🛠️ 2. المرحلة الأولى: التأسيس التقني المعزول وبنية الملفات (Phase 1 - ✅ مكتملة بالكامل)

### 📁 هيكل المجلدات والملفات المكتملة للمرحلة الأولى:

```text
shahntak/
├── types/
│   └── data.ts                              # [MODIFY] إضافة interfaces الجلسة المثرية، CompanyContext، UserRole، و ApiResponse
├── lib/
│   ├── authOptions.ts                       # [MODIFY] إضافة مزود المصادقة company-credentials وموصلات الجلسة
│   ├── guards/
│   │   ├── withCompanyGuard.ts              # [NEW] المعالج الرئيسي المحمي HOC لعزل استعلامات APIs بحسب companyId
│   │   └── checkSubscriptionQuota.ts        # [NEW] فحص أتمتة حصص الاشتراكات والباقات لشركة الشحن
│   └── validations/
│       └── helpers.ts                       # [NEW] دالة validateRequestBody مع PaginationQuerySchema
├── services/
│   └── company/                             # [NEW] طبقة خدمات الربط المستقلة للشركة (Services Layer):
│       ├── CompanyOrderServices.ts
│       ├── CompanyShipmentServices.ts
│       ├── CompanyInvoiceServices.ts
│       ├── CompanyEmployeeServices.ts
│       ├── CompanyReportServices.ts
│       └── CompanySettingsServices.ts
└── hooks/
    └── company/                             # [NEW] طبقة الـ Custom React Query Hooks القياسية لكل موديل:
        ├── useCompanyOrder.ts
        ├── useCompanyShipment.ts
        ├── useCompanyInvoice.ts
        ├── useCompanyEmployee.ts
        ├── useCompanyReport.ts
        ├── useCompanySettings.ts
        └── useCompanyPermission.ts
```

---

## 🛡️ 3. الدليل المعماري واللوجيك البرمجي الشامل (Multi-Tenant SaaS Logic)

### 📐 أ) الأنواع والواجهات التجريدية (TypeScript Types & Interfaces)

```typescript
// 👤 أدوار المستخدمين الفردية
export type UserRole = 
  | "super_admin" 
  | "admin"
  | "company_owner" 
  | "company_manager" 
  | "company_staff" 
  | "customer";

// 🔐 أنواط الصلاحيات والإجراءات
export type PermissionAction = "read" | "create" | "update" | "softDelete" | "delete";

// 📦 جلسة المستخدم المثرية (Enriched Session User)
export interface EnrichedUserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;       // معرّف الشركة اللوجستية الرئيسي (companyId)
  branchId?: string;       // معرّف الفرع (إن وجد)
  impersonatedBy?: {
    id: string;
    role: string;
  } | null;
}

// 🌐 الاستجابة القياسية الموحدة لجميع الـ APIs
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  stats?: {
    total: number;
    active: number;
    inactive: number;
  };
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
  };
  isExpired?: boolean;       // يشير إلى انتهاء اشتراك الشركة
  isFeatureLocked?: boolean; // يشير إلى أن الميزة مغلقة في الباقة
  error?: string;
}

// 🎯 سياق المستأجر/الشركة في الباك-إند (Backend Company Context)
export interface CompanyContext {
  userId: string;
  companyId: string;
  branchId?: string;
  role: UserRole;
  queryFilter: Record<string, any>; // شرط MongoDB المحمي تجميعياً
}
```

---

### ⚙️ ب) المعالج الرئيسي المحمي في الباك-إند (Reusable Higher-Order API Handler: `withCompanyGuard`)

```
[ Request ] ➡️ [ 1. Session Check ] ➡️ [ 2. RBAC Check ] ➡️ [ 3. Quota Check ] ➡️ [ 4. Query Scoping ] ➡️ [ Response ]
```

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { can } from "@/utils/permissions";
import { CompanyContext, PermissionAction } from "@/types/data";

export function withCompanyGuard(
  resource: string,
  action: PermissionAction,
  handler: (req: NextRequest, context: CompanyContext) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // 1️⃣ فحص الجلسة والتوثيق
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, message: "غير مصرح لك بالوصول" },
          { status: 401 }
        );
      }

      const userId = session.user.id;
      const role = session.user.role as any;
      const companyId = session.user.companyId;
      const branchId = session.user.branchId;

      // 2️⃣ فحص الصلاحيات (RBAC Check)
      if (!can(role, resource, action)) {
        return NextResponse.json(
          { success: false, message: "لا تملك الصلاحيات الكافية لهذا الإجراء" },
          { status: 403 }
        );
      }

      // 3️⃣ فحص الاشتراك والعمليات المكتوبة (POST, PUT, PATCH, DELETE)
      if (action !== "read" && role !== "super_admin") {
        const subCheck = await checkCompanySubscriptionQuota(companyId, resource);
        if (!subCheck.isAllowed) {
          return NextResponse.json(
            { 
              success: false, 
              message: subCheck.message || "عذراً، تم تجاوز حد الباقة المسموح",
              isExpired: subCheck.isExpired,
              isFeatureLocked: subCheck.isFeatureLocked,
            },
            { status: 403 }
          );
        }
      }

      // 4️⃣ بناء شرط الاستعلام المحمي (Query Scoping)
      const queryFilter: Record<string, any> = {
        deletedAt: null,
      };

      // عزل جبري لحسابات موظفي ومدراء الشركات
      if (role !== "super_admin") {
        if (!companyId) {
          return NextResponse.json(
            { success: false, message: "حسابك غير مرتبط بشركة نشطة" },
            { status: 400 }
          );
        }
        queryFilter.companyId = companyId; // 🛑 شرط التوفير الجبري للشركة
      } else {
        // إذا كان سوبر أدمن وأرسل companyId في الـ URL يتم الفلترة بها
        const { searchParams } = new URL(req.url);
        const filterCompanyId = searchParams.get("companyId");
        if (filterCompanyId) {
          queryFilter.companyId = filterCompanyId;
        }
      }

      const context: CompanyContext = { userId, companyId, branchId, role, queryFilter };

      return await handler(req, context);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: "حدث خطأ غير متوقع في الخادم", error: error.message },
        { status: 500 }
      );
    }
  };
}
```

---

### 🔍 ج) طبقة التحقق من صحة البيانات (Zod Validation Layer)

```typescript
import { z } from "zod";
import { NextResponse } from "next/server";

// 📝 مخطط معاملات البحث والترقيم الموحد
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// 🛠️ دالة مساعدة للتحقق الآمن من مدخلات الـ Body
export async function validateRequestBody<T>(
  req: Request, 
  schema: z.ZodSchema<T>
): Promise<{ data?: T; errorResponse?: NextResponse }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.errors[0]?.message || "بيانات المدخلات غير صحيحة";
      return {
        errorResponse: NextResponse.json(
          { success: false, message: firstError, errors: result.error.flatten().fieldErrors },
          { status: 400 }
        ),
      };
    }
    return { data: result.data };
  } catch {
    return {
      errorResponse: NextResponse.json(
        { success: false, message: "فشل في قراءة بيانات الطلب (Invalid JSON)" },
        { status: 400 }
      ),
    };
  }
}
```

---

### 🎣 د) طبقة الهوكس في الواجهة الأمامية (Frontend Custom React Hooks)

```typescript
// 1️⃣ هوك فحص الصلاحيات بالواجهة
import { useSession } from "next-auth/react";
import { can } from "@/utils/permissions";
import { PermissionAction } from "@/types/data";

export function useCompanyPermission() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const checkPermission = (resource: string, action: PermissionAction): boolean => {
    if (!role) return false;
    return can(role, resource, action);
  };

  return {
    can: checkPermission,
    role,
    companyId: (session?.user as any)?.companyId,
    branchId: (session?.user as any)?.branchId,
  };
}

// 2️⃣ هوك جلب البيانات
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/types/data";

export function useCompanyQuery<T>(key: string[], endpoint: string, queryParams?: Record<string, any>) {
  const queryString = queryParams ? new URLSearchParams(queryParams as any).toString() : "";
  const fullUrl = `${endpoint}${queryString ? `?${queryString}` : ""}`;

  return useQuery<ApiResponse<T>>({
    queryKey: [...key, queryParams],
    queryFn: async () => {
      const res = await fetch(fullUrl);
      const data: ApiResponse<T> = await res.json();

      if (!res.ok || !data.success) {
        if (data.isExpired) {
          console.warn("اشتراك الشركة انتهى! يرجى التواصل مع الإدارة للتجديد.");
        }
        throw new Error(data.message || "حدث خطأ أثناء جلب البيانات");
      }

      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// 3️⃣ هوك التعديل والإضافة مع إبطال الكاش
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

interface MutationOptions {
  endpoint: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  invalidateKey: string[];
}

export function useCompanyMutation<TInput, TResponse>({ endpoint, method, invalidateKey }: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TInput) => {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "فشلت العملية");
      }
      return data as TResponse;
    },
    onSuccess: (data: any) => {
      toast.success(data.message || "تمت العملية بنجاح");
      queryClient.invalidateQueries({ queryKey: invalidateKey });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
```

---

## 🏛️ 4. المرحلة الثانية: التخطيط والهيكل الرئيسي (Phase 2 - ✅ مكتملة بالكامل)

* **`app/company/layout.tsx`**: الجذر الأساسي لبوابة الشركة.
* **`app/company/dashboard/layout.tsx`**: التخطيط الموحد (مكون من `CompanySidebar` و `CompanyHeader`).
* **`components/company/layout/CompanySidebar.tsx`**: القائمة الجانبية بروابط الأقسام الستة ومؤشر الباقة النشطة.
* **`components/company/layout/CompanyHeader.tsx`**: الهيدر برأس الصفحة، معلومات الشركة، الملف الشخصي، ورابط الخروج.

---

## 📦 5. المرحلة الثالثة: بناء وتنميط واجهات الأقسام الثمانية لسيستم الشركة (الهدف المباشر للجلسة القادمة 🎯)

مربوطة بالكامل بالـ Custom React Query Hooks والمعزولة بـ `companyId` و `useCompanyPermission`:

### 1️⃣ قسم إدارة الطلبات (`app/company/dashboard/orders`) - ✅ مكتمل بالكامل
- **المكون الرئيسي**: `CompanyOrders.tsx` (جدول الطلبات المعزول، الفلترة بالحالة والبحث السيرفري، كروت KPI).
- **الهواكس**: `useCompanyOrders`, `useCompanyOrderDetails`, `useCreateCompanyOrder`, `useUpdateCompanyOrder`, `useDeleteCompanyOrder`, `useGroupCompanyOrders`.
- **المودالات المنبثقة**:
  - `AddCompanyOrderPopup.tsx`: نموذج إضافة طلب فردي أو مجمع للشركة.
  - `EditCompanyOrderPopup.tsx`: نموذج تعديل بيانات الطلب والمستلم.
  - `DetailsCompanyOrderPopup.tsx`: تفاصيل الطلب، الوزن، القيمة، والتتبع.
  - `GroupCompanyOrdersPopup.tsx`: تجميع الطلبات المحددة آلياً في شحنة واحدة.

### 2️⃣ قسم إدارة الشحنات وتعيين الموارد (`app/company/dashboard/shipments`) - ✅ مكتمل بالكامل
- **المكون الرئيسي**: `CompanyShipments.tsx` (جدول الشحنات المجمعة للشركة، تتبع الحالة اللحظي، زر طباعة البوليصة 🖨️).
- **الهواكس**: `useCompanyShipments`, `useCompanyShipmentDetails`, `useCreateCompanyShipment`, `useUpdateCompanyShipment`, `useDeleteCompanyShipment`.
- **المودالات المنبثقة**:
  - `AddCompanyShipmentPopup.tsx`: نموذج تجميع/إنشاء شحنة جديدة.
  - `EditCompanyShipmentPopup.tsx`: نموذج تعديل بيانات الشحنة والمركبة والمسار.
  - `DetailsCompanyShipmentPopup.tsx`: تفاصيل الشحنة والبوليصة والناقل.

### 3️⃣ قسم البوالص والفواتير المالية (`app/company/dashboard/invoices`) - ✅ مكتمل بالكامل
- **المكون الرئيسي**: `CompanyInvoices.tsx` (فواتير الشحن والفوترة، المبالغ المحصلة والمستحقة).
- **الهواكس**: `useCompanyInvoices`, `useCompanyInvoiceDetails`.
- **المودالات المنبثقة**:
  - `DetailsCompanyInvoicePopup.tsx`: عرض التفاصيل المالية وعناصر الفاتورة وطباعتها الضريبية.

### 4️⃣ قسم فريق العمل والموظفين (`app/company/dashboard/employees`) - ✅ مكتمل بالكامل
- **المكون الرئيسي**: `CompanyEmployees.tsx` (جدول فريق عمل الشركة `CompanyUser`).
- **الهواكس**: `useCompanyEmployees`, `useCompanyEmployeeDetails`, `useCreateCompanyEmployee`, `useUpdateCompanyEmployee`, `useDeleteCompanyEmployee`.
- **المودالات المنبثقة**:
  - `AddCompanyEmployeePopup.tsx`: نموذج إضافة موظف وتحديد دوره (`owner`, `manager`, `staff`).
  - `EditCompanyEmployeePopup.tsx`: نموذج تعديل بيانات وتجميد/تفعيل الموظف.
  - `DetailsCompanyEmployeePopup.tsx`: تفاصيل الموظف وسجل نشاطه.

### 5️⃣ قسم الأسطول والشاحنات (`app/company/dashboard/vehicles`)
- **المكون الرئيسي**: `CompanyVehicles.tsx` (جدول مركبات وشاحنات الشركة).
- **الهواكس**: `useCompanyVehicles`, `useCompanyVehicleDetails`, `useCreateCompanyVehicle`, `useUpdateCompanyVehicle`, `useDeleteCompanyVehicle`.
- **المودالات المنبثقة**: `AddCompanyVehicle.tsx`, `EditCompanyVehicle.tsx`, `DetailsCompanyVehicle.tsx`.

### 6️⃣ قسم التقارير والإحصائيات (`app/company/dashboard/reports`)
- **المكون الرئيسي**: `CompanyReports.tsx` (كروت KPI دقيقة لأداء شحنات الشركة، نسب التوصيل، وإجمالي التكاليف).
- **الهواكس**: `useCompanyReports`.

### 7️⃣ قسم إعدادات الشركة والاشتراك (`app/company/dashboard/settings`)
- **المكون الرئيسي**: `CompanySettings.tsx` (الملف التعريفي للشركة، الرقم الضريبي، السجل التجاري، ومتابعة الباقة والاشتراك النشط والحدود المتبقية).
- **الهواكس**: `useCompanySettings`, `useUpdateCompanySettings`.

### 8️⃣ لوحة التحكم والداشبورد الرئيسية (`app/company/dashboard`) - ✅ مكتمل بالكامل
- **المكون الرئيسي**: `CompanyDashboard.tsx` (عرض ملخص إحصائيات الطلبات، الشحنات، الفواتير، الأسطول، والمجاري المباشرة).

---

## 🎨 6. القواعد البصرية المعيارية (Design System Compliance)

* **الجداول والفلاتر**: `rounded-md` (6px) وحاوية بدون ظلال `border border-border bg-surface`.
* **كروت الـ KPI**: أيقونات دائرية `w-10 h-10 rounded-full bg-accent-soft text-accent` وحاوية `border border-border rounded-sm p-5 bg-surface`.
* **المودالات**: نماذج التعديل والإضافة بنفس الهيدر (`bg-accent-soft text-accent`) والأزرار القياسية.
