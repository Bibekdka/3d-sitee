import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, CreditCard, MapPin, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '@/store/cartStore';
import { useUserStore } from '@/store/userStore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

/**
 * Cart Page Component
 * Handles viewing items, adjusting quantities, and initializing the checkout process.
 */
export default function CartPage() {
  const { items, updateQty, removeItem, clearCart } = useCartStore();
  const { user } = useUserStore();
  const navigate = useNavigate();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  // Totals calculation
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const shipping = items.length > 0 ? 25 : 0;
  const total = subtotal + shipping;

  /**
   * Completes the checkout process by saving the order to Firestore.
   */
  const handleFinalizeOrder = async () => {
    if (!user) {
      toast.error("Authentication required for transmission", {
        description: "Please login to proceed with the checkout."
      });
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      // Create order manifest for Firestore
      const orderData = {
        userId: user.uid,
        items: items.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty,
          image: i.image,
          variant: i.variant || 'Standard',
          finish: i.finish || 'Matte Noir'
        })),
        subtotal,
        shipping,
        total,
        status: 'processing',
        shippingAddress: {
          fullName: user.displayName || 'Unnamed Commander',
          address: '742 Cyber Lane', // Placeholder - in real app would be a form input
          city: 'Neo Tokyo',
          state: 'Kanto',
          zipCode: '100-0001',
          country: 'Japan'
        },
        paymentId: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      // Clear cart locally
      clearCart();
      setOrderComplete(true);
      toast.success("Order Archive Secured", {
        description: "Transmission successful. Check dashboard for tracking."
      });
    } catch (err) {
      console.error("Order Failure:", err);
      toast.error("Transmission Interrupted: Database Desync");
    } finally {
      setLoading(false);
    }
  };

  // If order is just completed, show success screen
  if (orderComplete) {
    return (
      <div className="h-screen flex flex-col items-center justify-center pt-20 px-6">
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-cyan-400 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(34,211,238,0.4)]"
        >
          <CheckCircle2 className="w-12 h-12 text-black" />
        </motion.div>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-center">Transmission Complete</h2>
        <p className="text-white/40 mb-12 text-center max-w-md font-medium">Your order has been etched into the global ledger. Our fabricators are initializing production cycles now.</p>
        <Link to="/shop">
          <Button className="bg-white text-black font-bold h-14 px-10 rounded-2xl hover:bg-cyan-400 transition-colors uppercase tracking-widest text-[10px]">Initialize New Search</Button>
        </Link>
      </div>
    );
  }

  // Empty state handling
  if (items.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center pt-20">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-8 border border-white/5">
          <ShoppingBag className="w-8 h-8 text-zinc-700" />
        </div>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4">Registry is empty</h2>
        <p className="text-white/30 text-sm mb-8 font-medium">No active constructs found in current session buffer.</p>
        <Link to="/shop">
          <Button className="bg-cyan-400 text-black font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl hover:scale-105 transition-transform">Access Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
         <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter">Manifest</h1>
         <div className="h-px flex-1 bg-white/5" />
         <span className="text-zinc-500 font-mono text-sm tracking-widest">[{items.length} Units]</span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* 
          MAIN LIST AREA 
          Controls the scrolling list of items currently in the manifest.
        */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div 
                key={`${item.id}-${item.variant}-${item.finish}`}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-6 bg-white/5 border border-white/5 rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-6 group hover:border-white/10 transition-colors"
              >
                <div className="w-32 h-32 bg-zinc-900 rounded-3xl overflow-hidden shrink-0 border border-white/10 group-hover:border-cyan-500/30 transition-colors">
                  {/* ITEM THUMBNAIL: Displays the small preview of the carted item */}
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-black italic uppercase tracking-tighter text-xl mb-1">{item.name}</h3>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
                    <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-white/10 text-white/40">{item.variant}</Badge>
                    <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-white/10 text-white/40">{item.finish}</Badge>
                  </div>
                  <p className="text-cyan-400 font-mono italic font-bold">${item.price}</p>
                </div>
                
                {/* Quantity Controls */}
                <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5">
                  <button 
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors bg-white/5 rounded-xl"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-lg min-w-[2rem] text-center">{item.qty}</span>
                  <button 
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors bg-white/5 rounded-xl"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <button 
                  onClick={() => removeItem(item.id)}
                  className="p-4 text-zinc-600 hover:text-red-500 transition-colors bg-white/5 rounded-2xl"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 
           SIDEBAR SUMMARY AREA 
           Controls totals, checkout initialization, and finalized transmission.
        */}
        <aside>
          <div className="p-10 bg-zinc-950 border border-white/5 rounded-[3rem] sticky top-32 shadow-2xl backdrop-blur-md">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-8 italic">Transmission Summary</h3>
            
            <div className="space-y-6 mb-10">
              <div className="flex justify-between text-white/40 text-sm font-medium">
                <span>Unit Subtotal</span>
                <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white/40 text-sm font-medium">
                <span>Freight Protocol</span>
                <span className="font-mono text-white">${shipping.toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/5 my-6" />
              <div className="flex justify-between text-2xl font-black italic items-center">
                <span className="uppercase tracking-tighter">Manifest Total</span>
                <span className="text-cyan-400 font-mono shadow-[0_0_15px_rgba(34,211,238,0.2)]">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Simulated Checkout Steps */}
            {!isCheckingOut ? (
              <Button 
                onClick={() => setIsCheckingOut(true)}
                className="w-full h-16 bg-white text-black hover:bg-cyan-400 rounded-2xl font-black uppercase tracking-widest text-[11px] group transition-all"
              >
                Initialize Checkout
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                   <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <MapPin className="w-3 h-3 text-cyan-400" /> Logistical Node
                   </div>
                   <p className="text-xs text-white/60 leading-relaxed pl-6">
                    {user?.displayName || 'Commander'}<br/>
                    742 Cyber Lane, Neo Tokyo<br/>
                    Sector 42, JP 100-0001
                   </p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                   <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <CreditCard className="w-3 h-3 text-orange-500" /> Credit Allocation
                   </div>
                   <p className="text-xs text-white font-mono leading-relaxed pl-6 italic">
                    •••• •••• •••• 4242
                   </p>
                </div>
                <Button 
                  onClick={handleFinalizeOrder}
                  disabled={loading}
                  className="w-full h-16 bg-cyan-400 text-black hover:bg-white rounded-2xl font-black uppercase tracking-widest text-[11px] mt-4 disabled:opacity-50"
                >
                  {loading ? 'Transmitting...' : 'Finalize Transmission'}
                </Button>
                <button 
                  onClick={() => setIsCheckingOut(false)}
                  className="w-full text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
                >
                  Return to Manifest
                </button>
              </div>
            )}
            
            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                <span className="text-[9px] uppercase font-bold tracking-widest text-white/40">Secure Network Protocol</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
