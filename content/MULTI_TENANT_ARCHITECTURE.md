# 🛡️ دليل المعمارية البرمجية الشامل: المصادقة وفصل البيانات في الأنظمة متعددة المستأجرين
## (Multi-Tenant SaaS Architecture: Full-Stack Types, Auth, Zod Validations & React Hooks)

هذا المستند يوفر الدليل المعماري الكامل لبناء ونظام **SaaS متعدد المستأجرين (Multi-Tenant)** متكامل من الباك-إند وحتى الواجهة الأمامية في منصة **شحنتك (Shahntak)**، مع تطبيق التسميات الخاصة بشركات الشحن (`companyId`).

---

## 📐 1. الأنواع والواجهات التجريدية (TypeScript Types & Interfaces)

تتيح الأنواع الموحدة التنسيق التام بين الباك-إند والواجهة الأمامية ومنع أخطاء الأنواع.

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
  isExpired?: boolean;       // يشير إلى انتهاء اشتراك المؤسسة/الشركة
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

## 🛡️ 2. طبقة التوثيق وفصل البيانات في الباك-إند (4-Tier Isolation Architecture)

```
[ Request ] ➡️ [ 1. Session Check ] ➡️ [ 2. RBAC Check ] ➡️ [ 3. Query Scoping ] ➡️ [ 4. Response Clean ] ➡️ [ Response ]
```

### ⚙️ المعالج الرئيسي المحمي (Reusable Higher-Order API Handler: `withCompanyGuard`)

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

## 🔍 3. طبقة التحقق من صحة البيانات (Zod Validation Layer)

يتم تنظيف المدخلات وتوثيق البيانات المدخلة قبل وصولها لقاعدة البيانات، مع تجريد أي محاولة لحشر `companyId` مزيف من العميل.

```typescript
import { z } from "zod";
import { NextResponse } from "next/server";

// 📝 مخطط معاملات البحث والترقيم الموحد (Pagination & Search Query Schema)
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// 📝 مخطط إنشاء كيان طلب/شحنة تجريدي (Generic Entity Creation Schema)
export const CreateOrderSchema = z.object({
  recipientName: z.string("اسم المستلم مطلوب").min(2, "الاسم يجب أن يكون أكثر من حرفين"),
  recipientPhone: z.string("رقم جوال المستلم مطلوب").min(8, "رقم الجوال غير صحيح"),
  city: z.string("المدينة مطلوبة").min(2),
  weight: z.number({ message: "الوزن مطلوب" }).positive("الوزن يجب أن يكون موجباً"),
  price: z.number({ message: "السعر مطلوب" }).positive("السعر يجب أن يكون موجباً"),
  codAmount: z.number().nonnegative().default(0),
  // ملاحظة: يتم إهمال أي companyId يرسله العميل عمداً ويتم قراءته فقط من Session context
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

## 🎣 4. طبقة الهوكس في الواجهة الأمامية (Frontend Custom React Hooks)

باستخدام React Query (v5) و NextAuth في الواجهة الأمامية للتعامل السلس مع البيانات والتنبيهات:

### 1️⃣ هوك فحص الصلاحيات بالواجهة (`useCompanyPermission`)
```typescript
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
```

### 2️⃣ هوك جلب بيانات الشركة بذكاء (`useCompanyQuery`)
يتعامل هذا الهوك تلقائياً مع انتهاء الاشتراك وإظهار التنبيهات وإدارة الكاش:

```typescript
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
    staleTime: 1000 * 60 * 5, // 5 دقائق كاش افتراضي
  });
}
```

### 3️⃣ هوك التعديل والإضافة مع إبطال الكاش (`useCompanyMutation`)

```typescript
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

## 🏗️ 5. مثال عملي متكامل في شحنتك (Full Integration Example)

### 🟢 الباك-إند (`app/api/company/orders/route.ts`):
```typescript
import { withCompanyGuard } from "@/lib/guards/withCompanyGuard";
import { validateRequestBody, CreateOrderSchema } from "@/lib/validations";
import OrderModel from "@/models/order";

export const GET = withCompanyGuard("order", "read", async (req, context) => {
  const orders = await OrderModel.find(context.queryFilter).sort({ createdAt: -1 });
  return NextResponse.json({ success: true, data: orders });
});

export const POST = withCompanyGuard("order", "create", async (req, context) => {
  const { data, errorResponse } = await validateRequestBody(req, CreateOrderSchema);
  if (errorResponse) return errorResponse;

  const newOrder = await OrderModel.create({
    ...data,
    companyId: context.companyId, // ربط إجباري بـ companyId من الجلسة
    createdByUserId: context.userId,
  });

  return NextResponse.json({ success: true, message: "تم إضافة الطلب بنجاح", data: newOrder }, { status: 201 });
});
```

---

## 📌 الخلاصة التجميعية
تضمن هذه المعمارية المكونة من (Types + Zod Validations + 4-Tier Backend Guards + React Query Hooks):
1. **أمان تام في عزل البيانات**: يمنع استعلام أي شركة لبيانات شركة أخرى حتى لو حاول التلاعب بالـ URL أو الـ Payload.
2. **تجربة تطوير سلسة**: كود نظيف بدون تكرار باستخدام المعالجات والهوكس البرمجية.
3. **قابلة لإعادة الاستخدام الكامل**: تخدم منصة شحنتك ومستقبلاً أي توسعات لوجستية أو مستودعات سحابية.
