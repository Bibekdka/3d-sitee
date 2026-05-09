import { motion } from 'motion/react';

export default function LegalPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen pt-32 pb-20 px-10 max-w-4xl mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="prose prose-invert max-w-none"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] uppercase tracking-[0.2em] font-bold text-cyan-400 mb-8 font-mono">
          Legal Protocol v2.6
        </div>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-12">{title}</h1>
        
        <div className="space-y-12 text-white/50 leading-relaxed font-medium">
          <section>
            <h2 className="text-white text-xl font-bold uppercase tracking-widest mb-4">01. Overview</h2>
            <p>Welcome to Genesis Lab. These protocols govern your access to the digital manufacturing grid. By accessing the Lab, you acknowledge adherence to these synthetic laws.</p>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold uppercase tracking-widest mb-4">02. Data Manifest</h2>
            <p>We collect essential identity markers including email protocols and shipping coordinates solely for the purpose of construct delivery and system authorization. Your biometric data is never stored on our nodes.</p>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold uppercase tracking-widest mb-4">03. IP Protocols</h2>
            <p>Designs hosted on the Genesis Marketplace remain the intellectual property of their respective creators. Unauthorized replication of proprietary geometries is strictly prohibited by digital law.</p>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold uppercase tracking-widest mb-4">04. Liability</h2>
            <p>While we guarantee material integrity for industrial use, Genesis Lab is not liable for structural failures resulting from unauthorized modifications or use beyond the specified material tolerances.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
