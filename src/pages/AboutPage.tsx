import { motion } from 'motion/react';
import { Rocket, Shield, Cpu, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-10 max-w-5xl mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-16"
      >
        <header className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] uppercase tracking-[0.2em] font-bold text-cyan-400 mb-6 font-mono">
            Origin Protocol: Manifest
          </div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
            Genesis Lab
          </h1>
          <p className="text-xl text-white/40 max-w-2xl mx-auto leading-relaxed font-medium">
            We are not just a marketplace; we are the foundation of the next industrial revolution. 
            By bridging the gap between digital vision and physical manifestation, we empower creators to build the future.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: Rocket, title: "Our Mission", desc: "To democratize high-precision manufacturing through an accessible, global decentralized grid of industrial 3D printers." },
            { icon: Shield, title: "Material Integrity", desc: "Every construct is printed using proprietary carbon-alloy filaments, tested for aerospace-grade durability and heat resistance." },
            { icon: Cpu, title: "Digital Forge", desc: "Our advanced slicing algorithms and real-time print telemetry ensure your designs are materialized with 0.05mm precision." },
            { icon: Zap, title: "Velocity", desc: "From pixel to physical in record time. Our global network handles logistics so your vision reaches your doorstep within 48-72 hours." }
          ].map((feature, idx) => (
            <div key={idx} className="p-10 bg-white/5 border border-white/5 rounded-[2.5rem] backdrop-blur-sm group hover:border-cyan-500/30 transition-all">
              <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-8 border border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-all">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">{feature.title}</h3>
              <p className="text-white/40 leading-relaxed font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
