import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

export default function CartPage() {
  // Mock cart
  const cartItems = [
    { id: '1', name: 'Cyberpunk Helmet v2', price: 299, qty: 1, image: 'https://picsum.photos/seed/helmet/200/200' },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const shipping = 25;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center pt-20">
        <ShoppingBag className="w-16 h-16 text-zinc-800 mb-6" />
        <h2 className="text-2xl font-bold mb-4">Cart is empty</h2>
        <Link to="/shop">
          <Button className="bg-orange-500 rounded-full px-8">Return to Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-12">Manifest</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-zinc-900/50 border border-white/5 rounded-3xl flex items-center gap-6"
            >
              <div className="w-24 h-24 bg-zinc-800 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                <p className="text-orange-500 font-mono italic">${item.price}</p>
              </div>
              <div className="flex items-center gap-4 bg-black/40 p-2 rounded-xl border border-white/5">
                <button className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white"><Minus className="w-4 h-4" /></button>
                <span className="font-bold">{item.qty}</span>
                <button className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white"><Plus className="w-4 h-4" /></button>
              </div>
              <button className="p-3 text-zinc-600 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
            </motion.div>
          ))}
        </div>

        <aside>
          <div className="p-8 bg-zinc-900 border border-white/5 rounded-[2.5rem] sticky top-32">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500 mb-8 italic">Order Summary</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Transmission (Shipping)</span>
                <span className="font-mono">${shipping.toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/10 my-4" />
              <div className="flex justify-between text-xl font-bold">
                <span className="italic uppercase tracking-tighter">Total</span>
                <span className="text-orange-500 font-mono">${total.toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full h-14 bg-orange-500 hover:bg-orange-600 rounded-2xl font-black uppercase tracking-widest group">
              Initialize Checkout
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
