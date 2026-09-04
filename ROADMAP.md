# خارطة طريق وتوثيق إنجازات مشروع شهنتك اللوجستية (Project Roadmap & Changelog)

هذا المستند يوثّق أهم التحديثات والإنجازات التي تم تنفيذها اليوم، بالإضافة إلى حالة الأقسام والخطط المستقبلية لتطوير المنصة.

---

## 📅 الإنجازات والتحديثات المنفذة اليوم (Today's Completed Milestones - 2026-09-04)

### 1. 💰 إصلاح وحساب تكاليف النقل وأسعار الخدمة (Pricing & Shipping Cost Specs)
- [x] تصحيح وتفعيل حقول إدخال **تكلفة النقل الفعلي (`shippingCost`)** و**سعر الخدمة المحسوب للعملاء (`customerPrice`)** في نماذج تجميع الطلبات وإضافة/تعديل الشحنات.
- [x] حل مشكلة خطأ التحقق (HTTP 422 Validation Error) في نقطة نهاية API إنشاء وتعديل الشحنات (`POST /api/company/shipments/new`).
- [x] ضمان فصل التكلفة التشغيلية عن سعر العميل النهائي في كافة جداول ونوافذ الداشبورد.

---

### 2. 🧾 أتمتة إنشاء الفواتير الضريبية وحفظ الإجمالي (Automated Invoice Generation & Cascading Updates)
- [x] ربط تحديث حالة الشحنة إلى **"تم التوصيل" (`delivered`)** بإنشاء فاتورة ضريبية رسمية تلقائياً في قاعدة البيانات وحفظها بصفحة الفواتير (`company/dashboard/invoices`).
- [x] تصحيح قراءة وقيم الحقل `total` في جدول الفواتير ونافذة تفاصيل الفاتورة الضريبية.
- [x] تحديث حالة الطلبات المرتبطة بالشحنة تلقائياً عند تغيير حالة الشحنة الأم.

---

### 3. 📊 تفعيل تقارير ورسومات الداشبورد المباشرة (Live Aggregation Analytics)
- [x] ربط مخطط اتجاه الطلبات الأسبوعي (`weeklyOrdersTrend`) وتوزيع حالات الشحنات (`shipmentStatusBreakdown`) باستعلامات التجميع المباشرة (MongoDB Aggregation Pipeline) في `app/api/company/reports/route.ts`.
- [x] عرض البيانات الحية الحقيقية بالداشبورد بدلاً من البيانات التجريبية الثابتة.

---

### 4. 🌐 تعريب شامل وموحد لجميع الحالات والأدوار (Complete Arabic Status & Roles Localization)
- [x] **تعريب حالات الطلبات** (بما فيها حالة `grouped` ⬅️ **مجمع بشحنة**, `validated` ⬅️ **مؤكد**, `pending` ⬅️ **قيد الانتظار**, `shipped` ⬅️ **تم الشحن**, `delivered` ⬅️ **تم التوصيل**, `cancelled` ⬅️ **ملغي**, `error` ⬅️ **خطأ في البيانات**).
- [x] **تعريب حالات الشحنات الـ 13** (`created`, `confirmed`, `assigned`, `ready_for_pickup`, `picked_up`, `in_transit`, `arrived`, `out_for_delivery`, `delivered`, `delivery_failed`, `cancelled`, `returned`, `exception`).
- [x] **تعريب حالات وأدوار الموظفين** (`مالك الشركة`, `مدير تشغيل`, `موظف`, `نشط ومفعل`, `مجمد`).
- [x] **تعريب حالات الأسطول والمركبات** (`نشطة ومفعلة`, `متوقفة / غير نشطة`).
- [x] إزالة جميع النصوص والكلمات التوضيحية الإنجليزية المتبقية داخل القوائم المنسدلة وشارات الحالات.

---

### 5. 🎨 توحيد وتطوير النظام البصري لنوافذ التفاصيل (Unified Details Modals Design System)
- [x] إعادة تصميم وتوحيد جميع نوافذ عرض التفاصيل في لوحة تحكم الشركات لتتبع نفس الهيكلية المسطحة والأنيقة الخاصة بالفاتورة الضريبية:
  - 📄 **[DetailsCompanyInvoicePopup.tsx](file:///e:/projects/shahntak/components/company/invoices/DetailsCompanyInvoicePopup.tsx)**
  - 🚚 **[DetailsCompanyShipmentPopup.tsx](file:///e:/projects/shahntak/components/company/shipments/DetailsCompanyShipmentPopup.tsx)**
  - 📦 **[DetailsCompanyOrderPopup.tsx](file:///e:/projects/shahntak/components/company/orders/DetailsCompanyOrderPopup.tsx)**
  - 👥 **[DetailsCompanyEmployeePopup.tsx](file:///e:/projects/shahntak/components/company/employees/DetailsCompanyEmployeePopup.tsx)**
  - 🚛 **[DetailsCompanyVehiclePopup.tsx](file:///e:/projects/shahntak/components/company/vehicles/DetailsCompanyVehiclePopup.tsx)**
- [x] توحيد حواف النوافذ (`max-w-xl`, `rounded-md`), هيدر الأيقونة الحلقي (`w-10 h-10 rounded-full bg-accent/10`), شريط الملخص السريع العلوي, وكروت البيانات المحددة بحدود ناعمة.

---

### 6. 🖨️ تحسين وتخصيص طباعة البوالص والفواتير (Official Waybill & Invoice Print System)
- [x] تخصيص قواعد الطباعة `@media print` في `app/globals.css` لإخفاء أزرار الإغلاق والخلفيات المعتمة وطباعة البوليصة أو الفاتورة مباشرة بنقاء تام.
- [x] إضافة ترويسة رسمية لبوليصة الشحن الرسمية تحتوي على محاكاة الباركود وأماكن أختام وتواقيع التسليم والاستلام.

---

### 7. 📘 توثيق نظام التصميم (Design System Documentation)
- [x] إنشاء ملف توثيق رسمي في **[docs/company_ui_design_system.md](file:///e:/projects/shahntak/docs/company_ui_design_system.md)** يشمل فلسفة التصميم وكود الهيكل القياسي وجداول جميع شارات الحالات وقواعد الطباعة.

### 8. 🛡️ قفل وقواعد نزاهة حالات الطلبات والشحنات (State Machine & Financial Integrity Rules)
- [x] **قفل الشحنات والطلبات المسلمة (`delivered`)**:
  - قفل تعديل أي بيانات أو مبالغ مالية أو حالة الشحنات والطلبات المسلمة نهائياً (`delivered`) لحماية نزاهة الفواتير والتقارير المالية، مع إظهار شريط تنبيهي وتعطيل الحقول في نافذة التعديل (`EditCompanyShipmentPopup.tsx`).
- [x] **حظر القفز غير الشرعي بين الحالات (Status Jumping Safeguards)**:
  - منع التحويل المباشر من حالة الشحنة/الطلب الملغي (`cancelled`) إلى `in_transit` أو `delivered` دون إعادة تفعيل أولاً.
  - منع التحويل المباشر لشحنة فاشلة التوصيل (`delivery_failed`) إلى `delivered` دون إعادة الخروج للتوصيل.
  - منع تحويل الطلب من `pending` إلى `delivered` مباشرة دون ربطه بشحنة وتوصيله.
- [x] **أتمتة فك الارتباط وتأثيرات الإلغاء والحذف (Auto Decoupling & Reset)**:
  - عند إلغاء شحنة (`cancelled`) يتم تلقائياً فك ارتباط الطلبات وإعادتها لحالة قيد الانتظار (`pending`).
  - عند حذف طلب مجمع في شحنة، يتم تحديث وتخفيض عداد الطلبات الشقيقة بالشحنة الأم (`ordersCount`).
- [x] **تشديد عزل الشركات ومطابقة المدن في التجميع (Tenant Isolation & City Matching)**:
  - حظر تجميع طلبات تابعة لشركات مختلفة في شحنة نقل واحدة.
  - حظر تجميع طلبات ذات وجهات مختلفة عن وجهة الشحنة المطلوبة.
  - حظر تجميع طلبات غير متاحة للتجميع (حالات مغلقة مثل `grouped`, `shipped`, `delivered`).
- [x] **قفل تعديل المسارات أثناء الحركة**:
  - منع تعديل مدينة المصدر أو الوجهة لأي شحنة أصبحت في الطريق (`picked_up`, `in_transit`, `out_for_delivery`).

---

## 🚀 الخطط والقادم في الجلسات القادمة (Next Session Roadmap Tasks)

- [ ] **استكمال مراجعة وتطوير باقي صفحات المنصة**: الفحص الشامل وتصميم صفحات ومكونات المنصة المتبقية للتأكد من مطابقتها التامة لنظام التصميم القياسي وقواعد نزاهة البيانات.
- [ ] **إشعارات التتبع المباشر (Live Tracking Notifications)**: تفعيل التنبيهات الفورية عبر بروتوكولات WebSockets / SSE عند تغير حالة الشحنات والطلبات.
- [ ] **تصدير التقارير (Excel/PDF Reports Export)**: تفعيل إمكانية تحميل تقارير الأداء المالي والعمليات بصيغة Excel و PDF من شاشة التقارير والداشبورد.
- [ ] **تحسين محرك تجميع الطلبات الذكي (Smart Order Grouping)**: اقتراح تجميع الطلبات تلقائياً بناءً على تقارب الوجهات والحي والوزن الأقصى للشاحنة.
- [ ] **تنسيقات إضافية للبوالص الضريبية**: دعم نماذج طباعة البوالص متعددة الملصقات (Thermal Label Printing Format - 4x6 inch).
