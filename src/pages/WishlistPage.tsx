import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { getWishlist, removeFromWishlist } from '@/services/wishlistService';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Trash2, Box, Heart, ArrowRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrls: string[];
  category: string;
}

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlistProducts = async () => {
    setLoading(true);
    try {
      const productIds = await getWishlist();
      const productData: Product[] = [];
      
      for (const id of productIds) {
        const productRef = doc(db, 'products', id);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          productData.push({ id: productSnap.id, ...productSnap.data() } as Product);
        }
      }
      setProducts(productData);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistProducts();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await removeFromWishlist(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-10 max-w-7xl mx-auto relative z-10">
      <header className="mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] uppercase tracking-[0.2em] font-bold text-cyan-400 mb-6 font-mono">
          Neural Reserve: Saved Parameters
        </div>
        <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-4">Wishlist</h1>
        <p className="text-white/40 max-w-xl font-medium leading-relaxed">
          Your curated collection of high-precision constructs awaiting manifestation.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-white/20 font-black uppercase text-[10px] tracking-widest">Scanning Grid...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-cyan-500/30 transition-all duration-500 backdrop-blur-xl"
              >
                <div className="aspect-square relative bg-zinc-900/40 overflow-hidden">
                  <img 
                    src={product.imageUrls[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute top-6 right-6">
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => handleRemove(product.id)}
                      className="bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-red-500 hover:text-white rounded-full transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 italic">{product.category}</span>
                    <span className="text-xl font-bold font-mono">${product.price}</span>
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4 group-hover:text-cyan-400 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex gap-4">
                    <Link to={`/product/${product.id}`} className="flex-1">
                      <Button className="w-full h-12 bg-white text-black hover:bg-cyan-400 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                        Details
                      </Button>
                    </Link>
                    <Button variant="outline" className="border-white/10 hover:bg-white/10 rounded-xl h-12 px-4 shadow-2xl">
                      <ShoppingBag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-32 text-center bg-white/5 border border-white/5 rounded-[3rem] backdrop-blur-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 border border-white/10 rounded-full mb-8">
            <Heart className="w-8 h-8 text-white/10" />
          </div>
          <h2 className="text-3xl font-black italic uppercase italic tracking-tighter mb-4">Reserve is Empty</h2>
          <p className="text-white/40 mb-8 max-w-sm mx-auto font-medium">No parameters saved for future manifestation. Browse the grid to find your next construct.</p>
          <Link to="/shop">
            <Button className="bg-cyan-400 text-black hover:bg-white rounded-full h-14 px-10 font-bold uppercase tracking-widest text-xs group">
              Scan Grid 
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
