import { useUserStore } from '@/store/userStore';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Package, MapPin, CreditCard, Settings } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate('/');
  };

  if (!user) return <div className="h-screen flex items-center justify-center">Access Denied. Please Sign In.</div>;

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-64 space-y-4">
          <div className="p-8 bg-zinc-900 border border-white/5 rounded-3xl text-center">
            <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-orange-500 mx-auto mb-6 overflow-hidden">
               {user.photoURL ? <img src={user.photoURL} alt="" /> : <User className="w-full h-full p-4 text-zinc-600" />}
            </div>
            <h2 className="font-bold text-xl mb-1">{user.displayName || 'Genesis User'}</h2>
            <p className="text-zinc-500 text-xs uppercase tracking-widest">{user.role}</p>
          </div>

          <nav className="space-y-1">
            {[
              { label: 'Orders', icon: Package },
              { label: 'Addresses', icon: MapPin },
              { label: 'Payments', icon: CreditCard },
              { label: 'Settings', icon: Settings },
            ].map((item) => (
              <Button key={item.label} variant="ghost" className="w-full justify-start h-12 gap-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl">
                <item.icon className="w-4 h-4" /> {item.label}
              </Button>
            ))}
            <Button 
              onClick={handleLogout}
              variant="ghost" 
              className="w-full justify-start h-12 gap-3 text-red-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </nav>
        </aside>

        <main className="flex-1 space-y-12">
          <section>
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 px-1 italic">Order History</h3>
            <div className="p-12 bg-zinc-900/50 border border-white/5 border-dashed rounded-[2rem] text-center">
              <Package className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No transmissions found</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
