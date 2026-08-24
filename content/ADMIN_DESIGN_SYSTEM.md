# 🎨 دليل نظام التصميم والهوية البصرية لـ "شحنتك" (Shahntak Admin Design System & UI Guide)

هذا المستند يُعد المرجع الشامل والأساسي للأسلوب البصري (**Design System**)، الألوان، الخطوط، المكونات، والتأثيرات التفاعلية المعتمدة في تصميم واجهات ولوحة تحكم **"شحنتك" (Shahntak Admin Dashboard)**.

---

## 🌈 1. البالتة اللونية والهوية البصرية (Color Palette & Theme Tokens)

يعتمد التصميم على **ثيم داكن/عصري فخم (Modern Dark & Glassmorphism Theme)** يمزج بين الاحترافية اللوجستية والجمال الرقمي المتقدم:

### 🎨 الألوان الرئيسية (Primary & Accent Colors)
* **الأخضر الزمردي اللوجستي (Primary Brand)**: `emerald-600` (`#059669`) / `emerald-500` (`#10b981`) -> يمثل الأمان والشحن والأساطيل.
* **الأزرق السماوي التفاعلي (Accent Cyan)**: `cyan-500` (`#06b6d4`) / `cyan-400` (`#22d3ee`) -> يُستخدم للـ Highlights وأزرار التفاعل الرئيسية.
* **الخلفية الداكنة الفخمة (Background Surface)**:
  * خلفية الصفحة: `slate-950` (`#020617`) أو `zinc-950` (`#09090b`).
  * البطاقات والحاويات (Card Surface): `slate-900/80` مع `backdrop-blur-md` وضبابية زجاجية.
  * الحدود والفاصل (Borders): `slate-800/80` و `border-slate-700/50`.

### 🏷️ ألوان الحالات والبادجات (Status Badge Palette)
| الحالة اللوجستية / التشغيلية | اللون الأساسي (Base) | خلفية البادج (Badge BG) | نص البادج (Text Color) |
| :--- | :--- | :--- | :--- |
| **نشط / مدفوع / تسليم (`active`, `paid`, `delivered`)** | Emerald | `bg-emerald-500/10 border-emerald-500/20` | `text-emerald-400` |
| **قيد الانتظار / مسودة (`pending`, `draft`, `created`)** | Amber / Yellow | `bg-amber-500/10 border-amber-500/20` | `text-amber-400` |
| **في الطريق / جارٍ الشحن (`in_transit`, `assigned`)** | Cyan / Sky | `bg-cyan-500/10 border-cyan-500/20` | `text-cyan-400` |
| **متأخر / خطأ / مرفوض (`overdue`, `error`, `banned`)** | Rose / Red | `bg-rose-500/10 border-rose-500/20` | `text-rose-400` |
| **مؤرشف / معطل (`archived`, `inactive`, `cancelled`)** | Slate / Gray | `bg-slate-500/10 border-slate-500/20` | `text-slate-400` |

---

## 🔤 2. الخطوط والطباعة (Typography & RTL Direction)

* **الخط العربي الرئيسي**: خط **Cairo** أو **Outfit** المرتكز على سهولة القراءة الفائقة بالأرقام والنصوص.
* **الاتجاه العام**: دعم كامل للاتجاه العربي من اليمين لليسار (`dir="rtl"`).
* **التسلسل الهرمي للخطوط (Font Hierarchy)**:
  * العناوين الرئيسية (`h1`): `text-2xl font-bold tracking-tight text-white`.
  * العناوين الفرعية (`h2` / `h3`): `text-lg font-semibold text-slate-200`.
  * النصوص الوصفية: `text-sm text-slate-400`.
  * نصوص الجداول والحقول: `text-sm font-medium text-slate-200`.

---

## 🧩 3. مكونات الواجهة وتصميم العناصر (UI Components Specs)

### 📊 أ) كروت الإحصائيات (KPI & Stat Cards)
* **التأثير البصري**: بطاقة زجاجية (`glassmorphism`) بتوهج خفيف عند التمرير (`hover:border-emerald-500/40 transition-all duration-300`).
* **الهيكل**:
  * أيقونة مميزة خلفها مربع ملون شفاف `bg-emerald-500/10 p-3 rounded-xl text-emerald-400`.
  * الرقم الإحصائي الأكبر: `text-3xl font-extrabold text-white font-mono`.
  * بادج نسبة التغير أو النمو السنوي/الشهري.

### 📋 ب) الجداول البيانات (Data Tables)
* **الهيكل**:
  * رأس الجدول (Header): `bg-slate-900/90 text-slate-400 text-xs font-semibold uppercase tracking-wider py-3.5 px-4 text-right`.
  * صفوف الجدول (Rows): `border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors py-4 px-4`.
  * الإجراءات السريعة (Actions Menu): أزرار مصغرة للتعديل والحذف وتغيير الحالة مع أيكولوجيا تفاعلية (`react-icons/lu`).
  * الترقيم (Pagination): شريط سفلي متناسق يعرض الصفحة الحالية، إجمالي السجلات، وأزرار التنقل.

### 🖼️ ج) المودالات والنوافذ المنبثقة (Modal Dialogs)
* **التصميم**:
  * الحاوية الخلفية (Overlay): `fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 animate-fade-in`.
  * صندوق النافذة (Modal Body): `bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 transform transition-all scale-100`.
  * الهيدر: عنوان النافذة بزر إغلاق أملس `text-slate-400 hover:text-white`.

### 📝 د) النماذج وحقول الإدخال (Form Inputs UI)
* **الحقل النصي (`FormInput`)**:
  * التنسيق: `w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all`.
  * رسائل الخطأ: بادج عربي أحمر تحت الحقل `text-xs text-rose-400 mt-1.5 flex items-center gap-1 font-medium`.
* **الزر التفاعلي (`SubmitButton`)**:
  * زر رئيسي متدرج: `bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-emerald-950/50 transition-all active:scale-[0.98] disabled:opacity-50`.

---

## ✨ 4. التحرّكات والحركات الدقيقة (Micro-animations & Transitions)

* **Fade & Slide In**: استخدام أنيميشن الخروج والدخول السلس للـ Modals والرسائل التنبيهية (`animate-in fade-in zoom-in-95 duration-200`).
* **Hover Micro-transforms**: ارتفاع خفيف للكروت بمقدار `-translate-y-1` عند الـ Hover.
* **Loading Skeleton**: استخدام التأثير النبضي التفاعلي (`animate-pulse bg-slate-800 rounded-lg`) أثناء تحميل استعلامات `useQuery`.

---

## 📌 5. ملخص الدليل للتطبيق البرمجي

جميع المكونات والواجهات التي سيتم بناؤها في لوحة تحكم "شحنتك" ستسير وفق هذه القواعد البصرية للوصول إلى واجهة مستخدم فخمة، سريعة، ومبهرة للمستخدم من الوهلة الأولى.
