import { useState, useEffect, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Environment, PresentationControls } from '@react-three/drei';
import { motion } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, Share2, Heart, RotateCcw, ShieldCheck, Truck, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { addToWishlist, removeFromWishlist, getWishlist } from '@/services/wishlistService';

function ModelViewer({ url }: { url: string }) {
  // If no URL, use a placeholder sphere
  if (!url) return <mesh><sphereGeometry /><meshStandardMaterial color="#f97316" /></mesh>;
  
  // In a real app we'd use useGLTF(url)
  // For demo, we'll show a fallback but structure it correctly.
  return (
    <mesh scale={2}>
      <octahedronGeometry />
      <meshStandardMaterial color="#f97316" wireframe />
    </mesh>
  );
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState('Standard');
  const [selectedFinish, setSelectedFinish] = useState('Matte Noir');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const finishes = ['Matte Noir', 'Gloss Cobalt', 'Brushed Steel', 'Neon Pulse'];

  const handleSubmitReview = async () => {
    if (!newReviewComment.trim()) return toast.error("Report content required");
    setSubmittingReview(true);
    try {
      // Simulation of submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Manifest report submitted to neural link");
      setNewReviewComment('');
      setNewReviewRating(5);
    } catch (err) {
      toast.error("Telemetry upload failed");
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id!);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          // Default mock data if ID not found
          setProduct({
            id: '1',
            name: 'Cyberpunk Helmet v2',
            price: 299,
            description: 'A revolutionary wearable designed for the next era of personal security and style. 3D printed with impact-resistant carbon-fiber reinforced polymer.',
            category: 'Wearables',
            imageUrls: ['https://picsum.photos/seed/helmet/800/800'],
            model3dUrl: '',
            stock: 12,
            rating: 4.8,
            reviewsCount: 124,
            variants: ['Standard', 'Matte Black', 'Neon Edition']
          });
        }

        const wishlist = await getWishlist();
        setIsInWishlist(wishlist.includes(id!));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const toggleWishlist = async () => {
    try {
      if (isInWishlist) {
        await removeFromWishlist(id!);
        toast.info("Removed from reserve");
      } else {
        await addToWishlist(id!);
        toast.success("Added to neural reserve");
      }
      setIsInWishlist(!isInWishlist);
    } catch (err) {
      toast.error("Protocol Error: Check Authorization");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-orange-500 font-bold uppercase tracking-widest animate-pulse">Scanning Archive...</div>;

  return (
    <div className="min-h-screen pt-32 pb-20 max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* 3D Viewer Section */}
        <div className="relative aspect-square lg:h-[600px] bg-zinc-900 rounded-[3rem] overflow-hidden border border-white/10">
          <div className="absolute top-8 left-8 z-10">
            <Badge className="bg-cyan-500 text-black border-none px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">3D Preview Active</Badge>
          </div>
          <div className="absolute top-8 right-8 z-10 flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleWishlist}
              className={`bg-white/5 backdrop-blur-md rounded-full transition-all ${isInWishlist ? 'text-red-500 bg-red-500/10' : 'text-white'}`}
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current font-bold' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="bg-white/5 backdrop-blur-md rounded-full text-white hover:bg-white/10"><Share2 className="w-4 h-4" /></Button>
          </div>
          
          <Canvas dpr={[1, 2]} shadows camera={{ fov: 45 }}>
            <color attach="background" args={['#09090b']} />
            <Suspense fallback={null}>
              <PresentationControls speed={1.5} global zoom={0.5} polar={[-0.1, Math.PI / 4]}>
                <Stage environment="city" intensity={0.6}>
                  <ModelViewer url={product.model3dUrl} />
                </Stage>
              </PresentationControls>
            </Suspense>
            <OrbitControls enablePan={false} enableZoom={true} />
          </Canvas>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
            <div className="p-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center gap-3">
              <RotateCcw className="w-4 h-4 text-cyan-500 animate-spin-slow shadow-[0_0_10px_cyan]" />
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-400">Rotate View</span>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400 italic font-mono">{product.category}</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6 leading-none">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-cyan-400 fill-cyan-400' : 'text-zinc-700'}`} />
                ))}
              </div>
              <span className="text-zinc-500 font-bold text-sm underline">{product.reviewsCount} Reviews</span>
              <Badge variant="outline" className="border-green-500/20 text-green-500 bg-green-500/5 px-3 py-1">In Stock</Badge>
            </div>

            <p className="text-xl text-white/40 leading-relaxed mb-10 font-medium">
              {product.description}
            </p>

            <div className="space-y-8 mb-12">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 mb-4 font-mono">Structural Variant</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v: string) => (
                    <button
                      key={v}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-6 h-11 rounded-xl text-[10px] font-black border transition-all uppercase tracking-[0.2em] ${
                        selectedVariant === v 
                          ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                          : 'border-white/5 text-white/30 hover:border-white/20'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 mb-4 font-mono">Aesthetic Finish</h3>
                <div className="flex flex-wrap gap-3">
                  {finishes.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFinish(f)}
                      className={`px-6 h-11 rounded-xl text-[10px] font-black border transition-all uppercase tracking-[0.2em] ${
                        selectedFinish === f 
                          ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                          : 'border-white/5 text-white/30 hover:border-white/20'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="text-5xl font-black italic text-white tracking-widest font-mono">${product.price}</div>
              <Button size="lg" className="flex-1 w-full bg-cyan-400 hover:bg-white text-black h-16 rounded-2xl md:rounded-full text-lg font-black uppercase tracking-widest shadow-xl shadow-cyan-400/20 group transition-all">
                Add to Cart
                <ShoppingCart className="ml-3 group-hover:scale-110 transition-transform" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-12 pt-12 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-cyan-400 border border-white/10"><Truck className="w-5 h-5" /></div>
                <div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-white/30">Global Shipping</div>
                  <div className="text-xs font-bold">Fast transmission</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-cyan-400 border border-white/10"><ShieldCheck className="w-5 h-5" /></div>
                <div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-white/30">Lab Certified</div>
                  <div className="text-xs font-bold">Quality Guaranteed</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-32 pt-32 border-t border-white/5">
        <div className="flex flex-col md:flex-row gap-20">
          <div className="md:w-1/3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] uppercase tracking-[0.2em] font-bold text-cyan-400 mb-6 font-mono">
              Neural Feedback: Community Log
            </div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-6">User Reviews</h2>
            <div className="flex items-center gap-4 mb-8">
              <div className="text-6xl font-black italic">{product.rating}</div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-cyan-400 fill-cyan-400' : 'text-zinc-700'}`} />
                  ))}
                </div>
                <div className="text-white/40 text-xs font-bold uppercase tracking-widest">{product.reviewsCount} manifest logs</div>
              </div>
            </div>
            
            <div className="p-8 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-sm">
              <h4 className="text-xs font-black uppercase tracking-widest text-white/60 mb-4">Submit Manifest Report</h4>
              <div className="space-y-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setNewReviewRating(star)}
                      className="transition-colors"
                    >
                      <Star className={`w-6 h-6 ${star <= newReviewRating ? 'text-cyan-400 fill-cyan-400' : 'text-zinc-700'}`} />
                    </button>
                  ))}
                </div>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-cyan-500/50 min-h-[100px] resize-none"
                  placeholder="Share your technical findings..."
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                />
                <Button 
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="w-full bg-white text-black hover:bg-cyan-400 rounded-xl font-bold uppercase tracking-widest text-[10px] h-12 disabled:opacity-50"
                >
                  {submittingReview ? "Uploading..." : "Post Report"}
                  <Send className="w-3 h-3 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            {[
              { user: "Kaelen_0x", rating: 5, date: "48h ago", comment: "The layer adhesion on this specific geometry is phenomenal. Used the Carbon-Fiber variant and it withstands extreme thermal stress." },
              { user: "NeoVibe", rating: 4, date: "1w ago", comment: "Slight delay in logistics but the product integrity is as advertised. The matte finish looks incredibly stealthy." },
              { user: "Synth_Lord", rating: 5, date: "2w ago", comment: "Essential construct for my modular workstation. 0.05mm precision confirmed via digital caliper scan." }
            ].map((review, i) => (
              <div key={i} className="p-10 bg-white/5 border border-white/5 rounded-[2.5rem] relative group hover:border-white/10 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 font-black italic">
                      {review.user[0]}
                    </div>
                    <div>
                      <div className="text-sm font-black uppercase tracking-widest text-white">@{review.user}</div>
                      <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{review.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, starI) => (
                      <Star key={starI} className={`w-3 h-3 ${starI < review.rating ? 'text-cyan-400 fill-cyan-400' : 'text-zinc-800'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-white/40 leading-relaxed font-medium">"{review.comment}"</p>
                <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Badge variant="outline" className="text-[8px] border-cyan-500/20 text-cyan-400 uppercase font-black tracking-widest">Verified manifest</Badge>
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full h-16 border border-white/5 rounded-2xl text-white/20 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px]">
              Load more telemetry logs
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
