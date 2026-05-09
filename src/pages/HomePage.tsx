import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Sphere, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Box, Zap, ShoppingBag, Cpu, Sparkles, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getProductRecommendations } from '@/services/geminiService';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ShowcaseItem {
  id: string;
  imageUrl: string;
  comment: string;
  username: string;
}

function AnimatedShape() {
  return (
    <Float speed={4} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1, 100, 100]} scale={2.4}>
        <MeshDistortMaterial
          color="#22d3ee"
          speed={3}
          distort={0.4}
          radius={1}
        />
      </Sphere>
    </Float>
  );
}

export default function HomePage() {
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchRecs() {
      setLoadingAI(true);
      try {
        const recs = await getProductRecommendations(['cyberpunk', 'industrial', 'aerospace', 'minimalist']);
        setRecommendations(recs);
      } catch (err) {
        console.error("AI Fetch error:", err);
      } finally {
        setLoadingAI(false);
      }
    }
    fetchRecs();

    async function fetchShowcase() {
      try {
        const q = query(collection(db, 'showcase'), orderBy('createdAt', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShowcaseItem));
        if (list.length > 0) {
          setShowcaseItems(list);
        }
      } catch (err) {
        console.error("Showcase Fetch Error:", err);
      }
    }
    fetchShowcase();
  }, []);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % showcaseItems.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + showcaseItems.length) % showcaseItems.length);
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} />
            <AnimatedShape />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-10 w-full grid grid-cols-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="col-span-12 lg:col-span-7 flex flex-col justify-center gap-8"
          >
            <div className="inline-flex items-center self-start gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] uppercase tracking-[0.2em] font-bold text-cyan-400">
              Next Generation Additive Manufacturing
            </div>
            <h1 className="text-[60px] md:text-[84px] leading-[0.95] font-black tracking-tighter uppercase italic">
              FORGE THE <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-400">IMPOSSIBLE.</span>
            </h1>
            <p className="text-lg text-white/40 max-w-lg leading-relaxed font-medium">
              Access a global network of hyper-precision industrial printers. Upload, customize, and materialize complex geometries with proprietary carbon-alloy materials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link to="/shop">
                <Button className="px-10 py-7 bg-white text-black font-bold flex items-center gap-3 rounded-xl hover:scale-105 transition-transform text-lg uppercase tracking-tight">
                  Explore Marketplace
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/showcase">
                <Button className="px-10 py-7 bg-black border border-white/20 text-white font-bold flex items-center gap-3 rounded-xl hover:bg-white/5 transition-colors text-lg uppercase tracking-tight">
                  View 3D Demo
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-12 border-t border-white/10 pt-8">
              <div>
                <div className="text-2xl font-mono font-bold">0.05mm</div>
                <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Precision Tolerance</div>
              </div>
              <div>
                <div className="text-2xl font-mono font-bold">48h</div>
                <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Avg Materialization</div>
              </div>
              <div>
                <div className="text-2xl font-mono font-bold">12k+</div>
                <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Verified Creators</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Recommendations Section */}
      <section className="py-20 relative z-10 px-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-700">
            <div className="absolute top-0 right-0 p-8">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            
            <div className="max-w-2xl relative z-10">
              <div className="flex items-center gap-2 mb-4 text-cyan-400">
                <Cpu className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">Lab AI Intelligence</span>
              </div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-6">Manifestation Queries</h2>
              
              {loadingAI ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  <div className="h-10 bg-white/10 rounded-xl mt-8"></div>
                </div>
              ) : recommendations ? (
                <div className="space-y-8">
                  <div className="text-white/60 font-medium leading-relaxed">
                    {recommendations.split('\n').filter(l => l.trim()).map((line, i) => (
                      <div key={i} className="mb-2 flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                        <p>{line.replace(/^[*-]\s*/, '')}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all font-bold uppercase tracking-widest text-[10px]">
                    Initialize Neural Design
                  </Button>
                </div>
              ) : (
                <p className="text-white/20 italic">Awaiting neural uplink...</p>
              )}
            </div>
            
            {/* Background design elements for AI section */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-cyan-500/10 transition-colors"></div>
          </div>
        </div>
      </section>

      {/* Showcase Carousel Section */}
      {showcaseItems.length > 0 && (
        <section className="py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-10">
            <div className="flex items-center justify-between mb-12">
              <div>
                <span className="text-cyan-400 text-xs font-black uppercase tracking-[0.3em] italic mb-4 block">Community Manifestations</span>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic">Neural Showcase</h2>
              </div>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={prevSlide}
                  className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={nextSlide}
                  className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[3rem] aspect-[21/9] bg-white/5 border border-white/5">
              <motion.div 
                className="flex h-full"
                animate={{ x: `-${activeSlide * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {showcaseItems.map((item) => (
                  <div key={item.id} className="min-w-full h-full relative group">
                    <img 
                      src={item.imageUrl} 
                      alt={item.comment} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="max-w-xl"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-full bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-cyan-400" />
                          </div>
                          <span className="text-sm font-bold tracking-widest uppercase text-cyan-400">@{item.username}</span>
                        </div>
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-white">
                          "{item.comment}"
                        </h3>
                        <Link to="/showcase">
                          <Button className="bg-white text-black hover:bg-cyan-400 rounded-full font-bold uppercase tracking-widest text-[10px] px-8">
                            View Full Showcase
                          </Button>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Progress Indicators */}
              <div className="absolute bottom-12 right-12 flex gap-2">
                {showcaseItems.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all duration-300 ${activeSlide === i ? 'w-12 bg-cyan-400' : 'w-4 bg-white/20'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-32 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-10">
          <div className="mb-20">
            <span className="text-cyan-400 text-xs font-black uppercase tracking-[0.3em] italic mb-4 block">Engineered for Excellence</span>
            <h2 className="text-4xl font-black tracking-tighter uppercase italic">System Protocols</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Box, title: "Precision", desc: "Micron-level accuracy for industrial components and artistic masterpieces." },
              { icon: Zap, title: "Scale", desc: "Global distributed printing grid ensuring zero latency in materialization." },
              { icon: Shield, title: "Trust", iconColor: "text-cyan-400", desc: "Verified materials and blockchain-backed design authenticity." }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="p-10 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-md hover:border-cyan-500/30 transition-all group"
              >
                <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-8 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black mb-4 uppercase italic tracking-tight">{feature.title}</h3>
                <p className="text-white/40 leading-relaxed text-sm font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
