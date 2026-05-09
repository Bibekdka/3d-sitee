import { Link } from 'react-router-dom';
import { Rocket, Twitter, Instagram, Github, Youtube, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-10">
        <div className="flex gap-8 items-center text-[11px] font-mono text-white/30 tracking-wider">
          <div className="flex items-center gap-2 text-white/60">
            <span className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#22c55e]"></span>
            LATEST DROP: POLY-GEOM V4
          </div>
          <div className="hidden sm:block">UPTIME: 99.998%</div>
          <div className="hidden sm:block">LATENCY: 12ms</div>
        </div>
        <div className="flex gap-6 items-center text-white/30 text-[11px] font-bold uppercase tracking-widest">
          <Link to="/about" className="hover:text-white transition-colors cursor-pointer">About</Link>
          <Link to="/contact" className="hover:text-white transition-colors cursor-pointer">Contact</Link>
          <Link to="/faq" className="hover:text-white transition-colors cursor-pointer">FAQ</Link>
          <Link to="/privacy" className="hover:text-white transition-colors cursor-pointer">Privacy</Link>
          <Link to="/terms" className="hover:text-white transition-colors cursor-pointer">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
