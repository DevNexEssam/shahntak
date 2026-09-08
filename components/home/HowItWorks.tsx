import { FaUserPlus, FaUsers, FaBox } from 'react-icons/fa';

const steps = [
  {
    number: '٠١',
    icon: FaUserPlus,
    title: 'سجل شركتك',
    body: 'أنشئ حساب شركتك في دقائق. أضف تفاصيل عملك وفروعك وخطوطك اللوجستية — بدون رسوم إعداد، بدون عقود طويلة الأجل.',
  },
  {
    number: '٠٢',
    icon: FaUsers,
    title: 'أضف الموظفين والسائقين',
    body: 'ادعُ أعضاء فريقك، وحدد الأدوار والصلاحيات، وسجل سائقيك والناقلين المتعاقد معهم. يحصل كل شخص على مستوى الوصول الخاص به.',
  },
  {
    number: '٠٣',
    icon: FaBox,
    title: 'ابدأ في إدارة الشحنات',
    body: 'أنشئ الطلبات أو استوردها، ووحّدها في شحنات، وخصصها للمركبات والمسارات، وتتبع التسليم في الوقت الفعلي، وأصدر فواتير متوافقة مع هيئة الزكاة والضريبة والجمارك.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-padding bg-surface-muted">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-[720px] text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">
            طريقة العمل
          </span>
          <h2 className="mt-3 text-3xl font-semibold text-heading md:text-4xl">
            انطلق في ثلاث خطوات
          </h2>
          <p className="mt-4 text-lg">
            من التسجيل إلى أول شحنة لك — شحناتك تجعل عمليتك تنطلق بسرعة.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.number}
              className="relative rounded-lg border border-border bg-surface p-7 shadow-sm"
            >
              <span className="numeric text-4xl font-bold text-accent">{s.number}</span>
              <h3 className="mt-4 text-xl font-bold text-heading">{s.title}</h3>
              <p className="mt-2.5 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}