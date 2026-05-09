import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, User, Menu, X, Rocket, Box, Users, Search, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/userStore';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUserStore();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Shop', path: '/shop', icon: Box },
    { name: 'Showcase', path: '/showcase', icon: Users },
    { name: 'Genesis', path: '/', icon: Rocket },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-20 ${
        isScrolled ? 'bg-black/40 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-10 h-full flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center rotate-45 group-hover:rotate-90 transition-transform duration-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-bold tracking-tighter uppercase transition-colors">
              Genesis <span className="text-cyan-400">Lab</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 translate-y-[1px]">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`text-sm font-medium tracking-widest uppercase transition-colors hover:text-white ${
                  location.pathname === link.path ? 'text-cyan-400 underline underline-offset-4 decoration-2' : 'text-white/50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse"></div>
            <span className="text-[10px] font-mono tracking-widest text-white/70">SYS_ACTIVE_NODE_01</span>
          </div>

          <div className="flex items-center gap-2 border-l border-white/10 pl-6 ml-2">
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="text-white/50 hover:text-white relative hover:bg-white/5 rounded-full">
                <Heart className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="text-white/50 hover:text-white relative hover:bg-white/5 rounded-full">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-[10px] flex items-center justify-center rounded-full text-black font-bold">0</span>
              </Button>
            </Link>
            {user ? (
              <Link to="/profile">
                <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden hover:border-cyan-400/50 transition-colors">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-white/50" />
                  )}
                </div>
              </Link>
            ) : (
              <Link to="/auth">
                <Button className="bg-white text-black text-sm font-bold rounded-full hover:bg-cyan-400 px-6 transition-all duration-300">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white/70 hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-zinc-900 border-b border-white/10 p-6 flex flex-col gap-6 md:hidden"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 text-lg font-medium"
              >
                <link.icon className="w-5 h-5 text-orange-500" />
                {link.name}
              </Link>
            ))}
            <div className="h-px bg-white/10" />
            <Link 
              to="/cart" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-4 text-lg font-medium"
            >
              <ShoppingCart className="w-5 h-5 text-orange-500" />
              Cart (0)
            </Link>
            <Link 
              to={user ? "/profile" : "/auth"} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-4 text-lg font-medium"
            >
              <User className="w-5 h-5 text-orange-500" />
              {user ? "Profile" : "Sign In"}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
