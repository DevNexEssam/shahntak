import React from 'react';
import { HiPlus } from 'react-icons/hi2';

const faqData = [
    {
        q: 'Is our company data separated from other companies on the platform?',
        a: 'Completely. Every company gets a fully isolated workspace — orders, branches, drivers, and reports belong only to your company and are never visible to any other company registered on Shahntak.',
        defaultOpen: true,
    },
    {
        q: 'Is there a separate app for drivers?',
        a: 'Yes, drivers use an independent mobile app to receive tasks, update shipment status, and communicate directly with the branch during delivery.',
    },
    {
        q: 'Can we cancel the subscription or change the plan at any time?',
        a: 'Absolutely. You can upgrade or downgrade your plan, or cancel your subscription at any time directly from your account settings, with no long-term commitments.',
    },
    {
        q: 'Does Shahntak integrate with our online store?',
        a: 'Yes, you can connect Shahntak to platforms like Salla, Zid, and WooCommerce, plus an open API and Webhooks to build custom integrations with any system you use.',
    },
    {
        q: 'Do we need a technical team to start using the platform?',
        a: 'No. The dashboard is designed so you can start without any technical expertise — register your company, add your branches and drivers, and get going within minutes. Our support team is available if you need help.',
    },
];

export const Faq: React.FC = () => {
    return (
        <section className="py-[100px] bg-surface-muted" id="faq">
            <div className="max-w-[1240px] mx-auto px-6">

                <div className="max-w-[640px] mx-auto text-center mb-14">
                    <span className="text-accent font-extrabold text-[13.5px] tracking-[0.5px] mb-3.5 block">
                        FAQ
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-heading tracking-[-0.4px] mb-3.5">
                        Got a Question? We Probably Have the Answer
                    </h2>
                    <p className="text-[16.5px] text-body">
                        Didn't find your answer here? Reach out to our team and we'll get back to you quickly.
                    </p>
                </div>

                <div className="max-w-[760px] mx-auto flex flex-col gap-3.5">
                    {faqData.map((faq, i) => (
                        <details
                            key={i}
                            open={faq.defaultOpen}
                            className="group bg-surface border border-border open:border-accent rounded-[18px] px-[26px] py-1.5 transition-colors"
                        >
                            <summary className="cursor-pointer flex items-center justify-between gap-4 py-5 font-bold text-base text-heading list-none [&::-webkit-details-marker]:hidden">
                                <span>{faq.q}</span>
                                <span className="w-7 h-7 rounded-full bg-surface-muted group-open:bg-accent group-open:text-white group-open:rotate-45 transition-all duration-300 flex items-center justify-center shrink-0">
                                    <HiPlus className="w-4 h-4" />
                                </span>
                            </summary>
                            <p className="text-[14.5px] text-body pb-[22px] -mt-1.5 max-w-[640px] leading-relaxed">
                                {faq.a}
                            </p>
                        </details>
                    ))}
                </div>

            </div>
        </section>
    );
};