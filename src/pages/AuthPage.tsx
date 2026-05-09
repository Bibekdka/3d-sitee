import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Boxes, Key, Mail, Github, Chrome } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Create user doc if it doesn't exist
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          avatarUrl: result.user.photoURL,
          role: 'user',
          createdAt: new Date().toISOString()
        });
      }
      
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back!');
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          role: 'user',
          createdAt: new Date().toISOString()
        });
        toast.success('Account created!');
      }
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4 bg-[url('https://picsum.photos/seed/tech/1920/1080?blur=10')] bg-cover bg-fixed">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md bg-zinc-900/50 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-[1.25rem] flex items-center justify-center mx-auto mb-6 rotate-12 group shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            <Boxes className="text-white w-8 h-8 -rotate-12" />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter mb-2 uppercase">Genesis <span className="text-cyan-400">Lab</span></h1>
          <p className="text-white/40 font-medium tracking-wide">{isLogin ? 'Accessing Central Node' : 'Initializing New Unit Registry'}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-white/40 uppercase text-[10px] font-black tracking-widest ml-1">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <Input 
                type="email" 
                placeholder="commander@genesis.lab" 
                className="bg-white/5 border-white/10 pl-11 h-14 rounded-2xl focus:border-cyan-500/50 transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/40 uppercase text-[10px] font-black tracking-widest ml-1">Security Key</Label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="bg-white/5 border-white/10 pl-11 h-14 rounded-2xl focus:border-cyan-500/50 transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-white text-black hover:bg-cyan-400 rounded-2xl font-black uppercase tracking-[0.2em] transition-all text-xs"
          >
            {loading ? 'Processing...' : isLogin ? 'Authorize Access' : 'Register Unit'}
          </Button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]"><span className="bg-[#0b0c10] px-4 text-white/20">Protocol Handshake</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            onClick={handleGoogleSignIn}
            className="border-white/10 bg-white/5 hover:bg-white/10 h-14 rounded-2xl flex items-center gap-3 font-bold uppercase tracking-widest text-[10px]"
          >
            <Chrome className="w-4 h-4" /> Google
          </Button>
          <Button 
            variant="outline" 
            disabled
            className="border-white/10 bg-white/5 hover:bg-white/10 h-14 rounded-2xl flex items-center gap-3 font-bold uppercase tracking-widest text-[10px] opacity-40 cursor-not-allowed"
          >
            <Github className="w-4 h-4" /> GitHub
          </Button>
        </div>

        <p className="mt-10 text-center text-[11px] font-mono text-white/30 tracking-wider">
          {isLogin ? "IDENTITY NOT FOUND?" : "UNIT ALREADY REGISTERED?"}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-cyan-400 font-bold hover:underline transition-colors"
          >
            {isLogin ? 'REGISTER' : 'LOGIN'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
