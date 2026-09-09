import Navbar from '@/components/home/Navbar';
import Features from '@/components/home/Features';
import HowItWorks from '@/components/home/HowItWorks';
import Pricing from '@/components/home/Pricing';
import { Faq } from '@/components/home/FAQ';
import Footer  from '@/components/home/Footer';
import Hero from '@/components/home/Hero';
import CTA from '@/components/home/Cta';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface text-body font-arabic selection:bg-accent selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        {/* <Integrations />
        <Stats />
        <Security />
        <Testimonials /> */}
        <Faq />
        <CTA />
        {/* <FinalCta /> */}
      </main>
      <Footer />
    </div>
  );
}