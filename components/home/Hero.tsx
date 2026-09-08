import { FaArrowRight, FaCheckCircle } from 'react-icons/fa';

const checkItems = [
    'دعم الشحنات الكاملة والشحنات الأقل من حمولة شاحنة',
    'فوترة ضريبية متوافقة مع هيئة الزكاة والضريبة والجمارك',
    'تتبع الأسطول في الوقت الفعلي وتخطيط المسار',
];

export default function Hero() {
    return (
        <section className="relative min-h-[calc(100vh-76px)] flex flex-col justify-center items-center py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-40" />
            <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-accent-soft rounded-full blur-[140px] opacity-60 -z-10" />
            <div className="absolute bottom-10 left-0 w-[500px] h-[500px] bg-success-soft rounded-full blur-[120px] opacity-40 -z-10" />

            <div className="container-narrow relative w-full my-auto flex flex-col items-center justify-center">
                <div className="max-w-4xl mx-auto text-center animate-fade-up">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-heading/40 text-xs sm:text-sm font-secondary font-medium mb-8 shadow-xs">
                        منصة سحابية متكاملة لخدمات الشحن واللوجستيات
                    </div>

                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-heading leading-[1.15] tracking-tight mb-8">
                        إدارة شحناتك، أسطولك، وفواتيرك من{' '}
                        <span className="text-gradient">مكان واحد</span>
                    </h1>

                    <p className="text-base sm:text-xl lg:text-2xl text-body leading-relaxed mb-10 max-w-3xl mx-auto">
                        شحناتك هي منصة سحابية للشركات لإدارة الخدمات اللوجستية،
                        النقل، وعمليات الشحن — مع شحنات موحدة،
                        تتبع الأسطول في الوقت الفعلي، وفوترة متوافقة مع هيئة الزكاة والضريبة والجمارك.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <a href="#cta" className="btn-primary text-base sm:text-lg px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all">
                            ابدأ الآن
                            <FaArrowRight className="w-5 h-5" />
                        </a>
                        <a href="#features" className="btn-outline text-base sm:text-lg px-8 py-4 rounded-xl">
                            استكشف الميزات
                        </a>
                    </div>

                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        {checkItems.map((item) => (
                            <li
                                key={item}
                                className="flex items-center justify-center gap-3 px-5 py-4 rounded-xl bg-surface/90 border border-border/80 text-xs sm:text-sm font-semibold text-heading shadow-xs hover:border-accent/40 hover:bg-accent-soft/30 transition-all duration-200 text-center"
                            >
                                <FaCheckCircle className="w-5 h-5 text-accent shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}