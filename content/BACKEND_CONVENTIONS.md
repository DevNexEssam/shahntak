# 🛠️ معايير وهندسة الباك إند لمشروع "شحنتك" (Backend API Conventions & Pattern)

> **الهدف**: توثيق النمط الموحد لبناء وتطوير الـ REST APIs لكافة نماذج قاعدة البيانات (Models) في مشروع شحنتك لضمان الاتساق والأمان وإعادة الاستخدام السهل.

---

## 📐 1. الهيكل العام والمسارات المخصصة لكل Model (Dedicated APIs Structure)

مع التزام جميع المسارات بالنمط المعماري الموحد، فإن **كل Model في القاعدة له مسار API مخصص له** يتعامل مع منطق الأعمال الخاص به (Custom Business Logic):

```text
app/api/admin/{resource}/
├── route.ts          # GET: جلب القائمة المعالجة (مع الترقيم والصفحات والإحصائيات)
├── new/
│   └── route.ts      # POST: إنشاء كيان جديد 
└── [id]/
    └── route.ts      # GET: جلب عنصر محدد | PATCH: تعديل | DELETE: حذف (Soft/Hard Delete)
```

### 🗺️ خريطة المسارات المخصصة والمنطق الخاص بكل Model:

| النموذج (Model) | مسار الـ API | منطق الأعمال المخصص (Custom Backend Logic) |
| :--- | :--- | :--- |
| **`User`** | `/api/admin/users` | تشفير كلمات المرور، إدارة المدراء والـ Super Admins، فحص الصلاحيات. |
| **`Company`** | `/api/admin/companies` | تفعيل وتجميد حسابات الشركات، متابعة الباقات، تسجيل الموافقة (`approvedBy`). |
| **`CompanyUser`** | `/api/admin/company-users` | إدارة موظفي الشركات، وتعيين الصلاحيات والأدوار (`owner`, `manager`, `staff`). |
| **`Order`** | `/api/admin/orders` | إنشاء الطلبات الفردية والجماعية (Bulk Upload)، وتجميع الطلبات في شحنة واحدة. |
| **`Shipment`** | `/api/admin/shipments` | ربط الشحنة بالمسار والناقل والمركبة، حساب أسعار الشحن، وتحديث حالة التتبع. |
| **`Carrier`** | `/api/admin/carriers` | إدارة الناقلين المحليين والربط مع APIs خارجية (`external_api`). |
| **`Vehicle`** | `/api/admin/vehicles` | إدارة الأسطول، والتحقق من الأحمال وسعات الوزن والحجم (`capacityWeight`). |
| **`Route`** | `/api/admin/routes` | تحديد المسارات والخطوط اللوجستية وتعيين الأسعار الأساسية لتقاطع المدن. |
| **`Waybill`** | `/api/admin/waybills` | إصدار وتوليد بوالص الشحن بصيغة PDF وتخزين رابطها مع رقم البوليصة. |
| **`Invoice`** | `/api/admin/invoices` | حساب الفواتير اللوجستية، الفترات المستحقة، وتغيير الحالات (`draft`, `paid`, `overdue`). |
| **`Payment`** | `/api/admin/payments` | إثبات سداد الفواتير وتحديث حالة الفاتورة وتوازن مدفوعات الشركات. |
| **`TrackingEvent`** | `/api/admin/tracking-events` | تسجيل النقاط الجغرافية وتحديث حالة الشحنة التابعة تلقائياً (`in_transit`, `delivered`). |
| **`Notification`** | `/api/admin/notifications` | توجيه وتحديث الإشعارات حسب المستلم والقناة (`email`, `sms`, `in_app`). |

---

## 🔄 2. دورة تنفيذ الـ API والخطوات الموحدة (Standard 6-Step API Lifecycle)

يجب أن يتبع كل handler في أي مسار الخطوات الست التالية بالترتيب:

### الخطوة 1: الاتصال بقاعدة البيانات (DB Connection)
```typescript
await connectDB();
```

### الخطوة 2: التحقق من الجلسة والصلاحيات (Auth & RBAC Check)
```typescript
const session = await getServerSession(authOptions);
const role = session?.user?.role;

if (!role || !can(role, "resource_name", "action_name")) {
    return NextResponse.json(
        { success: false, message: "غير مصرح لك بهذا الإجراء" },
        { status: 403 }
    );
}
```
* **الأفعال (Actions)**: `read` | `create` | `update` | `softDelete` | `delete`.

### الخطوة 3: التحقق من المعرفات والبيانات المدخلة (Validation)
* **معرف الـ ID**:
  ```typescript
  if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "معرف غير صالح" }, { status: 400 });
  }
  ```
* **جسم الطلب (JSON Body مع Zod Schema)**:
  * **تعريف الحقول الإجبارية (Required Fields Message)**:
    يجب دائماً تمرير نص رسالة الخطأ الواضحة باللغة العربية داخل المنشئ الأولي للحقل الإجباري مطابقة لـ Mongoose (`required: true`):
    ```typescript
    userName: z
        .string("اسم المستخدم مطلوب")
        .min(3, "اسم المستخدم يجب أن يكون على الأقل 3 أحرف")
        .max(50, "اسم المستخدم يجب أن لا يتجاوز 50 حرف"),
    weight: z
        .number({ message: "الوزن مطلوب" })
        .positive("الوزن يجب أن يكون رقماً موجباً"),
    ```
  * **معالجة التحقق وإرجاع الاستجابة**:
    ```typescript
    const validation = resourceCreateValidationSchema.safeParse(body);
    if (!validation.success) {
        return NextResponse.json({
            success: false,
            message: "بيانات غير صالحة",
            errors: validation.error.flatten().fieldErrors,
        }, { status: 422 });
    }
    ```

### الخطوة 3.5: التحقق من سلامة المراجع والربط بين الكائنات (Referential Integrity Check)
تطبق هذه القاعدة **إلزامياً عند الإنشاء (`POST /new`) وعند التعديل (`PATCH /[id]`)** على جميع الحقول المرجعية (`ObjectId` References):

* **الحقول المرجعية المغطاة بالنظام**:
  1. `approvedBy` ➔ يطابق معرف موجود في جدول `User`.
  2. `companyId` ➔ يطابق شركة موجودة ونشطة في جدول `Company`.
  3. `createdByUserId` ➔ يطابق موظف شركة موجود في جدول `CompanyUser`.
  4. `shipmentId` ➔ يطابق شحنة موجودة ونشطة في جدول `Shipment`.
  5. `carrierId` ➔ يطابق ناقل موجود في جدول `Carrier`.
  6. `vehicleId` ➔ يطابق شاحنة/مركبة موجودة في جدول `Vehicle`.
  7. `routeId` ➔ يطابق مسار لوجستي موجود في جدول `Route`.
  8. `invoiceId` ➔ يطابق فاتورة سارية في جدول `Invoice`.
  9. `recipientId` ➔ يطابق مستلم في `User` أو `CompanyUser` بحسب `recipientType`.

* **خطوات التنفيذ البرمجية المطلوبة**:
  1. **التحقق من صيغة الـ ObjectId**: فحص `mongoose.Types.ObjectId.isValid(refId)`. إذا كان غير صالح ➔ إرجاع `400` استجابة فورية.
  2. **التحقق من وجود الكيان في قاعدة البيانات**:
     ```typescript
     if (updatePayload.companyId && updatePayload.companyId.trim() !== "") {
         if (!mongoose.Types.ObjectId.isValid(updatePayload.companyId)) {
             return NextResponse.json({ success: false, message: "معرف الشركة (companyId) غير صالح" }, { status: 400 });
         }
         const targetCompany = await Company.findOne({ _id: updatePayload.companyId, ...ACTIVE }).lean();
         if (!targetCompany) {
             return NextResponse.json({ success: false, message: "الشركة المرتبطة (Company) غير موجودة بالنظام" }, { status: 400 });
         }
     }
     ```

### الخطوة 4: معالجة بيانات الأعمال والتشفير (Business Logic & Hashing)
* تحويل البريد/النصوص للحروف الصغيرة وتصفية المسافات `.toLowerCase().trim()`.
* تشفير كلمة المرور بـ `bcrypt.hash` في حالة الإنشاء أو التعديل (مع تجنب إعادة تشفير النص الفارغ).

### الخطوة 5: الاستعلام وتطبيق الحذف المؤقت (DB Execution & Active Filter)
* استخدام ثوابت تصفية الكائنات النشطة من `utils/constants.ts`:
  ```typescript
  import { ACTIVE } from "@/utils/constants"; // { deletedAt: null }
  ```
* استبعاد الحقول الحساسة: `.select("-password")`.
* الترتيب الافتراضي: `.sort({ createdAt: -1 })`.

### الخطوة 6: الاستجابة الموحدة ومعالجة الأخطاء (Unified Response Format)
يتم إرجاع استجابة بأسلوب موحد دائماً:

```typescript
// 🟢 نجاح الجلب أو التعديل (200)
return NextResponse.json({ success: true, message: "...", data: result }, { status: 200 });

// 🟢 نجاح الإنشاء (201)
return NextResponse.json({ success: true, message: "...", data: newDoc }, { status: 201 });

// 🔴 خطأ في الاستعلام أو الخادم (500)
return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً" }, { status: 500 });
```

---

## 📊 3. جدول رموز الاستجابة (HTTP Status Codes Standard)

| الرمز (Status) | المعنى | حالة الاستخدام |
| :--- | :--- | :--- |
| **`200 OK`** | نجاح العملية | جلب البيانات (GET)، التعديل (PATCH)، الحذف (DELETE). |
| **`201 Created`** | تم الإنشاء بنجاح | إضافة عنصر جديد عبر (POST). |
| **`400 Bad Request`** | طلب غير صالح | صيغة JSON خاطئة، أو معرف ObjectId غير صالح. |
| **`403 Forbidden`** | غير مصرح | عدم وجود جلسة، أو عدم امتلاك دور المستخدم للصلاحية المطلوبة. |
| **`404 Not Found`** | غير موجود | الكيان المطلق غير موجود أو تم حذفه سابقاً. |
| **`409 Conflict`** | تعارض بيانات | محاولة تسجيل بريد أو رقم هاتف أو رقم شحنة مكرر فريد. |
| **`422 Unprocessable`** | فشل التحقق (Validation Error) | قيود Zod لم تتحقق، مع إرجاع `errors: { field: ["error"] }`. |
| **`500 Server Error`** | خطأ غير متوقع | استثناء داخل الكتلة `catch`. |

---

## 🗑️ 4. نمط الحذف المؤقت (Soft Delete Pattern)

تعتمد المنصة نمط **Soft Delete** لمنع فقدان البيانات التشغيلية:

1. **نموذج البيانات (Model)**:
   يجب أن يحتوي كل Model على الحقول التالية:
   ```typescript
   status: { type: String, enum: [...], default: "active" },
   deletedAt: { type: Date, default: null }
   ```

2. **منطق الـ DELETE**:
   ```typescript
   const canSoftDelete = role && can(role, "resource", "softDelete");
   const canHardDelete = role && can(role, "resource", "delete");

   if (canSoftDelete) {
       deletedUser = await Model.findOneAndUpdate(
           { _id: id, ...ACTIVE },
           { status: "inactive", deletedAt: new Date() },
           { new: true }
       );
   } else if (canHardDelete) {
       deletedUser = await Model.findByIdAndDelete(id);
   }
   ```

---

## 💻 5. قالب كود مرجعي سريع (Boilerplate Template)

### أ) مسار القائمة والترقيم (`app/api/admin/{resource}/route.ts`):
```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";
// import Model from "@/models/Model";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "resource", "read")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const noPagination = searchParams.get("nopagination") === "true";

        if (noPagination) {
            const data = await Model.find(ACTIVE).sort({ createdAt: -1 });
            return NextResponse.json({ success: true, data, count: data.length }, { status: 200 });
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const data = await Model.find(ACTIVE).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Model.countDocuments(ACTIVE);

        return NextResponse.json({ success: true, data, count: data.length, total }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
```

---

## 📑 6. نمط وتوثيق أنواع البيانات والاستجابات (`types/data.ts`)

تحدد ملفات التعريفات في [`types/data.ts`](file:///e:/projects/shahntak/types/data.ts) الأنواع البرمجية الهيكلية (Interfaces) المستهلكة في الـ Frontend والـ Services:

1. **نوع الفرد (Single Entity Interface)**:
   يمثل الكائن الواحد المسترجع من نموذج قاعدة البيانات (مثل `User`, `Carrier`).
2. **نوع استجابة الجمع (Plural Response Interface)**:
   يمثل الهيكل القياسي لاستجابات الجلب الكلي والتصفية بالصفحات (`UserResponse`, `CarrierResponse`):
   ```typescript
   export interface ResourceResponse {
       success: boolean;
       data: Resource[];
       total: number;
       count: number;
       stats: {
           active: number;
           inactive: number;
           total: number;
       };
   }
   ```

---

تنسيق هذا الملف هو الدليل المعتمد لتطبيق كافة الـ Endpoints والأنواع التالية بنفس الدقة والاحترافية.

