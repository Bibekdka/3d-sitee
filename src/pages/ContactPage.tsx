import { motion } from 'motion/react';
import { Mail, MessageSquare, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-10 max-w-7xl mx-auto relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] uppercase tracking-[0.2em] font-bold text-cyan-400 mb-6 font-mono">
            Communications: Open Channel
          </div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-8 leading-none">
            Connect with <br/> the <span className="text-cyan-400">Lab</span>
          </h1>
          <p className="text-lg text-white/40 mb-12 font-medium leading-relaxed max-w-md">
            Need technical assistance or interested in enterprise-scale manufacturing solutions? Open a direct line with our engineering team.
          </p>

          <div className="space-y-8">
            <div className="flex items-center gap-6 group">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/50 group-hover:border-cyan-400 group-hover:text-cyan-400 transition-all">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Email Protocol</div>
                <div className="font-bold text-lg">liaison@genesis.lab</div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 group">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/50 group-hover:border-cyan-400 group-hover:text-cyan-400 transition-all">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Physical Coordinates</div>
                <div className="font-bold text-lg">Sector 07, Neo-Tokyo Grid</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 border border-white/5 p-10 rounded-[3rem] backdrop-blur-xl relative"
        >
          <form className="space-y-6">
            <div className="space-y-2">
              <Label className="text-white/40 uppercase text-[10px] font-black tracking-widest ml-1">Identity</Label>
              <Input placeholder="Commander Name" className="bg-white/5 border-white/10 h-14 rounded-2xl focus:border-cyan-500/50 transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/40 uppercase text-[10px] font-black tracking-widest ml-1">Signal (Email)</Label>
              <Input placeholder="email@address.net" className="bg-white/5 border-white/10 h-14 rounded-2xl focus:border-cyan-500/50 transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/40 uppercase text-[10px] font-black tracking-widest ml-1">Transmission</Label>
              <textarea 
                placeholder="Describe your construct or query..." 
                className="w-full min-h-[150px] bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:border-cyan-500/50 transition-all font-medium text-sm text-white resize-none"
              />
            </div>
            <Button className="w-full h-16 bg-white text-black hover:bg-cyan-400 rounded-2xl font-black uppercase tracking-[0.2em] transition-all text-xs group">
              Send Signal
              <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
