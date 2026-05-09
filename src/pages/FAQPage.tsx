import { motion } from 'motion/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function FAQPage() {
  const faqs = [
    { q: "What materials do you use?", a: "We primarily work with carbon-fiber reinforced PETG, industrial-grade PLA+, and high-detail translucent resins. Specialty materials like TPU and ESD-safe filaments are available upon request." },
    { q: "How long does shipping take?", a: "Standard manifestations are processed within 24 hours. Global transmission (shipping) typically takes 48-72 hours depending on your sector coordinates." },
    { q: "Can I upload my own .STL or .OBJ files?", a: "Currently, our Forge Portal is in closed beta for custom uploads. You can browse our verified marketplace of designs. Enterprise partners can contact us for custom batch production." },
    { q: "What is the precision level?", a: "Our grid maintains a tolerance of 0.05mm layer height and +/- 0.1mm dimensional accuracy for industrial constructs." },
    { q: "Are the prints recyclable?", a: "Yes, we prioritize sustainable filaments. Our PLA+ variants are biodegradable, and our carbon recyclates can be processed at Genesis reclamation centers." }
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-10 max-w-4xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] uppercase tracking-[0.2em] font-bold text-cyan-400 mb-6 font-mono">
          System FAQ: Operational Guidance
        </div>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Knowledge Base</h1>
      </div>

      <Accordion className="space-y-4">
        {faqs.map((faq, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`} className="border-white/10 bg-white/5 rounded-2xl px-6 border">
            <AccordionTrigger className="text-sm font-bold uppercase tracking-widest text-white/80 hover:text-cyan-400 hover:no-underline py-6">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-white/40 leading-relaxed font-medium pb-6">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
