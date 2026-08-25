import React from 'react';
import { Navbar } from '@/components/home/Navbar';
import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { Integrations } from '@/components/home/Integrations';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Stats } from '@/components/home/Stats';
import { Security } from '@/components/home/Security';
import { Pricing } from '@/components/home/Pricing';
import { Testimonials } from '@/components/home/Testimonials';
import { Faq } from '@/components/home/FAQ';
import { FinalCta } from '@/components/home/FinalCTA';
import { Footer } from '@/components/home/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface text-body font-arabic selection:bg-accent selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Integrations />
        <HowItWorks />
        <Stats />
        <Security />
        <Pricing />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}