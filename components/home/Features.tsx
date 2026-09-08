import { FaBox, FaTruck, FaFileAlt, FaUsers, FaChartBar, FaUpload, FaMapMarkerAlt, FaWallet } from 'react-icons/fa';

const modules = [
  {
    icon: FaBox,
    title: 'الطلبات والشحنات',
    description:
      'تحويل طلبات الشحن الفردية إلى شحنات موحدة — شحن كامل الحمولة، شحن أقل من حمولة شاحنة، أو توصيل محلي. استيراد مجمّع عبر Excel.',
    color: 'accent',
    features: ['شحن كامل / أقل من حمولة / توصيل محلي', 'استيراد مجمّع عبر Excel', 'توحيد تلقائي'],
  },
  {
    icon: FaTruck,
    title: 'الأسطول والمسارات',
    description:
      'تتبع المركبات المتعاقد عليها والناقلين. تحديد المسارات والخطوط اللوجستية بين المدن مع رؤية فورية.',
    color: 'accent',
    features: ['تتبع المركبات والناقلين', 'تحسين المسارات', 'خطوط بين المدن'],
  },
  {
    icon: FaFileAlt,
    title: 'الفواتير والمالية',
    description:
      'إصدار فواتير ضريبية متوافقة مع هيئة الزكاة والضريبة والجمارك (١٥٪ / ٠٪)، مزامنة أرقام بوالص الشحن، وتسجيل المصروفات التشغيلية لحساب صافي الربح تلقائياً.',
    color: 'accent',
    features: ['فوترة متوافقة مع هيئة الزكاة', 'مزامنة رقم بوليصة الشحن', 'تتبع المصروفات والأرباح'],
  },
  {
    icon: FaUsers,
    title: 'الفريق والموظفون',
    description:
      'تعيين الصلاحيات والأدوار للموظفين داخل شركتك. التحكم في من يمكنه عرض وتحرير وإدارة كل وحدة.',
    color: 'accent',
    features: ['التحكم القائم على الأدوار', 'إدارة الصلاحيات', 'سجلات نشاط الفريق'],
  },
  {
    icon: FaChartBar,
    title: 'التحليلات والتقارير',
    description:
      'تتبع الأداء المالي والتشغيلي والمصروفات والامتثال الضريبي من خلال لوحات معلومات فورية وتقارير قابلة للتصدير.',
    color: 'accent',
    features: ['لوحات مالية', 'مقاييس تشغيلية', 'تقارير الامتثال الضريبي'],
  },
  {
    icon: FaUpload,
    title: 'العمليات المجمّعة',
    description:
      'استيراد مئات الطلبات دفعة واحدة عبر Excel. تصدير التقارير والفواتير وبيانات الشحن بتنسيقات قياسية.',
    color: 'accent',
    features: ['استيراد مجمّع عبر Excel', 'تصدير بنقرة واحدة', 'تنسيقات قياسية'],
  },
];

const secondaryFeatures = [
  { icon: FaMapMarkerAlt, title: 'تتبع GPS فوري', description: 'اعرف بالضبط أين توجد كل مركبة في أي لحظة.' },
  { icon: FaWallet, title: 'حاسبة صافي الربح', description: 'حساب الربحية تلقائياً لكل شحنة بعد المصروفات.' },
  { icon: FaFileAlt, title: 'الفوترة الإلكترونية لهيئة الزكاة', description: 'فواتير ضريبية متوافقة جاهزة للوائح السعودية.' },
  { icon: FaTruck, title: 'إدارة الناقلين', description: 'إدارة الناقلين المتعاقد معهم مع تقييم الأداء.' },
];

export default function Features() {
  return (
    <section id="features" className="section-padding relative">
      <div className="container-narrow">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="badge-accent mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            وحدات المنصة
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-heading tracking-tight mb-4">
            كل ما تحتاجه شركة الشحن الخاصة بك
          </h2>
          <p className="text-lg text-body leading-relaxed">
            خمس وحدات متكاملة تغطي دورة الخدمات اللوجستية الكاملة — من إنشاء الطلب
            إلى التسليم النهائي وإصدار الفاتورة.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                className="card p-6 hover:shadow-lg hover:border-accent/30 group transition-all duration-300"
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-accent-soft flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-heading mb-2">{mod.title}</h3>
                <p className="text-sm text-body leading-relaxed mb-4">{mod.description}</p>
                <ul className="space-y-1.5">
                  {mod.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-body">
                      <span className="w-1 h-1 rounded-full bg-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {secondaryFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="flex items-start gap-3 p-5 rounded-xl bg-surface-muted border border-border hover:border-accent/30 transition-all duration-300"
                style={{ transitionDelay: `${idx * 60 + 200}ms` }}
              >
                <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-heading mb-1">{feat.title}</h4>
                  <p className="text-xs text-body leading-relaxed">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div> */}
      </div>
    </section>
  );
}