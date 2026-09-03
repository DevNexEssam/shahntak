# توثيق معمارية الـ Backend والعزل الأمني لبوابة الشركات (Company Portal Architecture)

توضح هذه الوثيقة المعمارية التنفيذية والخطوات المتبعة في كافة مسارات الـ Backend ضمن **بوابة الشركات** (`app/api/company/*`)، والتي تطبق أفضل ممارسات الـ **Multi-Tenant SaaS Isolation** وحظر ثغرات IDOR والتزوير.

---

## 1. الدستور المعماري الموحد لمسارات الشركة (Company API Blueprint)

لكل مسار API يتبع لبوابة الشركات (`/api/company/*`)، يتم التقيّد بالخطوات التنفيذية التالية:

### أ. التحقق من التوثيق وحصر الصلاحية (Authentication & Role Authorization)
* يستوجب كل مسار التحقق من الجلسة بـ `getServerSession(authOptions)`.
* **شرط الصلاحية الحصري**: يجب أن تكون الصلاحية صريحة `role === "company"` (يُرفض أي دور آخر أو زائر باستجابة `403 Forbidden`).

### ب. الحقن التلقائي لمعرف الشركة (Session Context Injection)
* لتجنب ثغرات انتحال الشخصية أو تزوير معرف الشركة (IDOR Attacks)، يتم استخراج المعرفات الأساسية (`companyId`, `userId`) مباشرة من سياق الجلسة الموثقة:
  ```typescript
  const { role, companyId, id: userId } = session.user as any;
  const activeCompanyId = companyId || userId;
  ```

### ج. التحقق من صحة ونشاط الشركة (Active Company Check)
* الاستعلام عن جدول الشركات (`Company`) في قاعدة البيانات للتأكد من أن حساب الشركة نشط (`status === "active"`) وغير محذوف (`deletedAt: null`). في حال تعطيل الشركة يُرفض الطلب فوراً.

### د. العزل التلقائي والشفاف للبيانات (Tenant Query Isolation)
* **في مسارات الجلب (`GET`)**: يُفرض شرط التصفية بشكل تلقائي وجبري على استعلامات قاعدة البيانات:
  ```typescript
  const filter: Record<string, any> = {
      companyId: new mongoose.Types.ObjectId(activeCompanyId),
      deletedAt: null,
  };
  ```
* **في مسارات الإضافة والتعديل (`POST/PUT`)**: يُحقن `companyId` و `createdBy` من التوكن جبرياً في الـ Body قبل تفعيل Zod Schema والتخزين:
  ```typescript
  body.companyId = activeCompanyId.toString();
  body.createdBy = userId.toString();
  ```

### هـ. قواعد التعليقات في الكود (Comments Standard)
* **بدون إيموجي أو آيقونات**: يُمنع استخدام الإيموجيات نهائياً داخل تعليقات الكود.
* **مختصرة جداً**: التعليق يتكون من كلمة إلى كلمتين فقط (مثال: `// get vehicle`, `// update vehicle`).
* **محدودة وقليلة**: عدم كتابة تعليقات كثيرة أو زائدة عن الحاجة.

---

## 2. كود إدارة الموظفين (Company Employees)

### أ. جلب قائمة الموظفين (`GET /api/company/employees/route.ts`)

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import CompanyUser from "@/models/Companyuser";
import Company from "@/models/companies";

// get employees
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "يجب تسجيل الدخول أولاً" }, { status: 401 });
        }

        const { role, companyId, id: userId } = session.user as any;

        if (role !== "company") {
            return NextResponse.json({ success: false, message: "غير مصرح لك: عرض الموظفين مخصص لحسابات الشركات فقط" }, { status: 403 });
        }

        const activeCompanyId = companyId || userId;
        if (!mongoose.Types.ObjectId.isValid(activeCompanyId)) {
            return NextResponse.json({ success: false, message: "معرف الشركة غير صالح" }, { status: 400 });
        }

        const company = await Company.findOne({ _id: activeCompanyId, status: "active", deletedAt: null });
        if (!company) {
            return NextResponse.json({ success: false, message: "حساب الشركة غير نشط أو تم تعطيله" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search")?.trim() || "";
        const noPagination = searchParams.get("nopagination") === "true";
        const statusFilter = searchParams.get("status");

        const filter: Record<string, any> = {
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        };

        if (statusFilter) filter.status = statusFilter;
        if (search) {
            filter.$or = [
                { userName: { $regex: search, $options: "i" } },
                { userEmail: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ];
        }

        if (noPagination) {
            const users = await CompanyUser.find(filter)
                .select("-password")
                .populate("companyId", "companyName email")
                .sort({ createdAt: -1 })
                .lean();

            return NextResponse.json({ success: true, data: users, count: users.length }, { status: 200 });
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const [users, total, activeCount, inactiveCount] = await Promise.all([
            CompanyUser.find(filter)
                .select("-password")
                .populate("companyId", "companyName email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            CompanyUser.countDocuments(filter),
            CompanyUser.countDocuments({ ...filter, userIsActive: true }),
            CompanyUser.countDocuments({ ...filter, userIsActive: false }),
        ]);

        return NextResponse.json(
            {
                success: true,
                data: users,
                count: users.length,
                stats: { active: activeCount, inactive: inactiveCount, total },
                pagination: { page, limit, totalPages: Math.ceil(total / limit), totalRecords: total },
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم أثناء جلب الموظفين", error: error.message }, { status: 500 });
    }
}
```

### ب. إنشاء موظف جديد (`POST /api/company/employees/new/route.ts`)

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import CompanyUser from "@/models/Companyuser";
import Company from "@/models/companies";
import { companyUserCreateValidationSchema } from "@/lib/validations";

// create employee
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "يجب تسجيل الدخول أولاً" }, { status: 401 });
        }

        const { role, companyId, id: userId } = session.user as any;

        if (role !== "company") {
            return NextResponse.json({ success: false, message: "غير مصرح لك: إضافة الموظفين مخصصة لحسابات الشركات فقط" }, { status: 403 });
        }

        const activeCompanyId = companyId || userId;
        if (!mongoose.Types.ObjectId.isValid(activeCompanyId)) {
            return NextResponse.json({ success: false, message: "معرف الشركة غير صالح" }, { status: 400 });
        }

        const company = await Company.findOne({ _id: activeCompanyId, status: "active", deletedAt: null });
        if (!company) {
            return NextResponse.json({ success: false, message: "حساب الشركة غير نشط أو تم تعطيله" }, { status: 403 });
        }

        const body = await req.json();

        body.companyId = activeCompanyId.toString();
        body.createdBy = userId.toString();

        const validation = companyUserCreateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: "بيانات الإدخال غير صالحة", errors: validation.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        const data = validation.data;
        const normalizedEmail = data.userEmail.toLowerCase().trim();
        const cleanPhone = data.phone.trim();

        const existingEmployee = await CompanyUser.findOne({
            $or: [{ userEmail: normalizedEmail }, { phone: cleanPhone }],
            deletedAt: null,
        });

        if (existingEmployee) {
            const isEmailTaken = existingEmployee.userEmail === normalizedEmail;
            return NextResponse.json(
                {
                    success: false,
                    message: isEmailTaken ? "البريد الإلكتروني مسجل بالفعل لموظف آخر" : "رقم الهاتف مسجل بالفعل لموظف آخر",
                },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newEmployee = await CompanyUser.create({
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            userName: data.userName.trim(),
            userEmail: normalizedEmail,
            phone: cleanPhone,
            password: hashedPassword,
            userRole: data.userRole || "staff",
            status: "active",
            permissions: data.permissions || [],
            userIsActive: data.userIsActive !== undefined ? data.userIsActive : true,
            createdBy: new mongoose.Types.ObjectId(userId),
            createdByType: "company",
            deletedAt: null,
        });

        const employeeResponse = newEmployee.toObject();
        delete employeeResponse.password;

        return NextResponse.json(
            { success: true, message: "تم إنشاء حساب الموظف بنجاح", employee: employeeResponse },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم أثناء إنشاء الموظف", error: error.message }, { status: 500 });
    }
}
```

---

## 3. كود إدارة المركبات (Company Vehicles)

### أ. جلب قائمة المركبات (`GET /api/company/vehicles/route.ts`)

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Vehicle from "@/models/vehicle";
import Company from "@/models/companies";

// get vehicles
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "يجب تسجيل الدخول أولاً" }, { status: 401 });
        }

        const { role, companyId, id: userId } = session.user as any;

        if (role !== "company") {
            return NextResponse.json({ success: false, message: "غير مصرح لك: تصفح المركبات مخصص لحسابات الشركات فقط" }, { status: 403 });
        }

        const activeCompanyId = companyId || userId;
        if (!mongoose.Types.ObjectId.isValid(activeCompanyId)) {
            return NextResponse.json({ success: false, message: "معرف الشركة غير صالح" }, { status: 400 });
        }

        const company = await Company.findOne({ _id: activeCompanyId, status: "active", deletedAt: null });
        if (!company) {
            return NextResponse.json({ success: false, message: "حساب الشركة غير نشط أو تم تعطيله" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search")?.trim() || "";
        const status = searchParams.get("status");
        const noPagination = searchParams.get("nopagination") === "true";

        const filter: Record<string, any> = {
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        };

        if (status === "active") filter.isActive = true;
        if (status === "inactive") filter.isActive = false;

        if (search) {
            filter.type = { $regex: search, $options: "i" };
        }

        if (noPagination) {
            const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 }).lean();
            return NextResponse.json({ success: true, data: vehicles, count: vehicles.length, total: vehicles.length }, { status: 200 });
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const [vehicles, total, activeCount, inactiveCount] = await Promise.all([
            Vehicle.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Vehicle.countDocuments(filter),
            Vehicle.countDocuments({ ...filter, isActive: true }),
            Vehicle.countDocuments({ ...filter, isActive: false }),
        ]);

        return NextResponse.json(
            {
                success: true,
                data: vehicles,
                count: vehicles.length,
                stats: { active: activeCount, inactive: inactiveCount, total },
                pagination: { page, limit, totalPages: Math.ceil(total / limit), totalRecords: total },
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم أثناء جلب المركبات", error: error.message }, { status: 500 });
    }
}
```

### ب. مسار إضافة مركبة ومسار تعديل/مسح المركبة (`app/api/company/vehicles/[id]/route.ts`)

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Vehicle from "@/models/vehicle";
import { vehicleUpdateValidationSchema } from "@/lib/validations/vehicle.schema";

// get vehicle
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "يجب تسجيل الدخول أولاً" }, { status: 401 });
        }

        const { role, companyId, id: userId } = session.user as any;
        if (role !== "company") {
            return NextResponse.json({ success: false, message: "غير مصرح لك" }, { status: 403 });
        }

        const activeCompanyId = companyId || userId;
        const { pathname } = new URL(req.url);
        const id = pathname.split("/").pop();

        const vehicle = await Vehicle.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        });

        if (!vehicle) {
            return NextResponse.json({ success: false, message: "لم يتم العثور على المركبة" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: vehicle }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم", error: error.message }, { status: 500 });
    }
}

// update vehicle
export async function PUT(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "يجب تسجيل الدخول أولاً" }, { status: 401 });
        }

        const { role, companyId, id: userId } = session.user as any;
        if (role !== "company") {
            return NextResponse.json({ success: false, message: "غير مصرح لك" }, { status: 403 });
        }

        const activeCompanyId = companyId || userId;
        const { pathname } = new URL(req.url);
        const id = pathname.split("/").pop();

        const vehicle = await Vehicle.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        });

        if (!vehicle) {
            return NextResponse.json({ success: false, message: "لم يتم العثور على المركبة أو لا تملك صلاحية التعديل عليها" }, { status: 404 });
        }

        const body = await req.json();

        delete body.companyId;
        delete body._id;

        const validation = vehicleUpdateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: "بيانات الإدخال غير صالحة", errors: validation.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            id,
            { $set: validation.data },
            { new: true, runValidators: true }
        );

        return NextResponse.json({ success: true, message: "تم تحديث بيانات المركبة بنجاح", data: updatedVehicle }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم أثناء تحديث المركبة", error: error.message }, { status: 500 });
    }
}

// delete vehicle
export async function DELETE(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "يجب تسجيل الدخول أولاً" }, { status: 401 });
        }

        const { role, companyId, id: userId } = session.user as any;
        if (role !== "company") {
            return NextResponse.json({ success: false, message: "غير مصرح لك" }, { status: 403 });
        }

        const activeCompanyId = companyId || userId;
        const { searchParams, pathname } = new URL(req.url);
        const id = pathname.split("/").pop();
        const isHardDelete = searchParams.get("hard") === "true";

        const vehicle = await Vehicle.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
        });

        if (!vehicle) {
            return NextResponse.json({ success: false, message: "لم يتم العثور على المركبة المراد حذفها" }, { status: 404 });
        }

        if (isHardDelete) {
            await Vehicle.deleteOne({ _id: id, companyId: new mongoose.Types.ObjectId(activeCompanyId) });
            return NextResponse.json({ success: true, message: "تم حذف المركبة نهائياً من النظام" }, { status: 200 });
        } else {
            vehicle.deletedAt = new Date();
            vehicle.isActive = false;
            await vehicle.save();
            return NextResponse.json({ success: true, message: "تم أرشفة وتجميد المركبة بنجاح" }, { status: 200 });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم أثناء حذف المركبة", error: error.message }, { status: 500 });
    }
}
```

---

## 🎯 4. حالة التنفيذ والخطط المتبقية (Execution Status & Target)

### ✅ ما تم تنفيذه واختباره بنجاح 100%:
1. **الموظفين (`CompanyUser`)**:
   - `GET /api/company/employees`
   - `POST /api/company/employees/new`
   - `GET/PUT/DELETE /api/company/employees/[id]`
2. **المركبات (`Vehicle`)**:
   - `GET /api/company/vehicles`
   - `POST /api/company/vehicles/new`
   - `GET/PUT/DELETE /api/company/vehicles/[id]`
3. **الطلبات (`Orders`)**:
   - `GET /api/company/orders`
   - `POST /api/company/orders/new`
   - `GET/PUT/DELETE /api/company/orders/[id]`
4. **الشحنات (`Shipments`)**:
   - `GET /api/company/shipments`
   - `POST /api/company/shipments/new`
   - `GET/PUT/DELETE /api/company/shipments/[id]`
5. **الفواتير (`Invoices`)**:
   - `GET /api/company/invoices`
   - `POST /api/company/invoices/new`
   - `GET/PUT/DELETE /api/company/invoices/[id]`
6. **التقارير والإحصائيات (`Reports`)**:
   - `GET /api/company/reports`

---

### ⏳ هدف الجلسة القادمة (Next Session Target):
1. **الانتقال لبناء لوحة التحكم والـ Layout الرئيسية للشركة (Company Portal Layout)**:
   - إنشاء `app/company/layout.tsx` و `app/company/dashboard/layout.tsx`.
   - بناء مكونات `CompanySidebar.tsx` و `CompanyHeader.tsx`.
2. **بناء وتنميط الواجهات التفاعلية للأقسام الستة**.

