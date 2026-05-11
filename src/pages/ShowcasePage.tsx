import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Plus, Heart, MessageSquare, Share2, Award } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { Link } from 'react-router-dom';

interface ShowcaseItem {
  id: string;
  userId: string;
  imageUrl: string;
  comment: string;
  likes: string[];
  createdAt: string;
  username?: string;
  avatarUrl?: string;
}

export default function ShowcasePage() {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUserStore();

  useEffect(() => {
    const fetchShowcase = async () => {
      try {
        const q = query(collection(db, 'showcase'), orderBy('createdAt', 'desc'), limit(12));
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShowcaseItem));
        setItems(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShowcase();
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-4">
             <Award className="text-cyan-400 w-5 h-5" />
             <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400 italic">Community Creations</span>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4">The Showcase</h1>
          <p className="text-white/40">Witness the manifestation of digital dreams into physical reality. Shared by our global community.</p>
        </div>
        
        <Link to="/auth">
           <Button className="bg-cyan-400 text-black hover:bg-white rounded-full h-14 px-8 gap-3 font-bold uppercase tracking-widest shadow-lg shadow-cyan-400/20 transition-all">
             <Plus className="w-5 h-5" /> Submit Creation
           </Button>
        </Link>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="break-inside-avoid relative group bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden hover:border-cyan-400/30 transition-all duration-500"
          >
            <img 
              src={item.imageUrl} 
              alt="Community print" 
              className="w-full h-auto group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
                  <img src={item.avatarUrl} alt={item.username} className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-bold text-white">{item.username}</span>
              </div>
              
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                "{item.comment}"
              </p>
              
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-zinc-500 hover:text-red-500 transition-colors">
                    <Heart className={`w-4 h-4 ${item.likes.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="text-xs font-bold">{item.likes.length}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-zinc-500 hover:text-cyan-400 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-bold">2</span>
                  </button>
                </div>
                <button className="text-zinc-500 hover:text-white transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
