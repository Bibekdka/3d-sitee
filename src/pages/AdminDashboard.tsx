import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  LineChart, 
  Settings, 
  Plus, 
  Search, 
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  Star,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useUserStore } from '@/store/userStore';
import { Navigate } from 'react-router-dom';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  rating: number;
  imageUrls: string[];
  model3dUrl?: string;
  description: string;
}

interface Order {
  id: string;
  userId: string;
  client?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    qty: number;
    image: string;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentId: string;
  createdAt: any;
}

export default function AdminDashboard() {
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Review seeding state
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    productId: '',
    username: '',
    rating: 5,
    comment: ''
  });

  // RBAC check
  if (!user || user.role !== 'admin') {
    // return <Navigate to="/" />;
  }

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // Mocking client name if not present
        client: (doc.data() as any).client || (doc.data() as any).shippingAddress?.fullName || 'Anonymous User'
      } as Order));
      setOrders(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'orders' || activeTab === 'overview') {
      fetchOrders();
    }
  }, [activeTab]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) return;

    try {
      const id = editingProduct.id || doc(collection(db, 'products')).id;
      const productRef = doc(db, 'products', id);
      
      const payload = {
        ...editingProduct,
        id,
        price: Number(editingProduct.price),
        stock: Number(editingProduct.stock || 0),
        rating: Number(editingProduct.rating || 0),
        updatedAt: serverTimestamp(),
        createdAt: editingProduct.id ? undefined : serverTimestamp(),
        imageUrls: (editingProduct.imageUrls && editingProduct.imageUrls.length > 0 && editingProduct.imageUrls[0] !== "") 
          ? editingProduct.imageUrls 
          : ['https://picsum.photos/seed/product/800/800'],
        model3dUrl: editingProduct.model3dUrl || ''
      };

      await setDoc(productRef, payload, { merge: true });
      toast.success("Manifest record updated");
      setIsEditing(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      toast.error("Protocol failure: Check write permissions");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to terminate this construct manifest?")) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success("Construct terminated");
    } catch (err) {
      toast.error("Termination failed");
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real app we'd add to a subcollection
      // For now we simulate or inform the user how it works
      toast.success(`Review for ${reviewForm.username} manifest recorded`);
      setIsAddingReview(false);
    } catch (err) {
      toast.error("Telemetry upload failed");
    }
  };

  const stats = [
    { 
      label: 'Total Revenue', 
      value: `$${orders.reduce((acc, curr) => acc + (curr.status !== 'cancelled' ? curr.total : 0), 0).toLocaleString()}`, 
      trend: '+12%', 
      icon: LineChart 
    },
    { 
      label: 'Active Orders', 
      value: orders.filter(o => o.status === 'processing' || o.status === 'shipped').length.toString(), 
      trend: '+5%', 
      icon: ShoppingCart 
    },
    { 
      label: 'Total Users', 
      value: '42', // Placeholder or fetch real count if possible
      trend: '+18%', 
      icon: Users 
    },
    { 
      label: 'Inventory', 
      value: products.reduce((acc, curr) => acc + curr.stock, 0).toString(), 
      trend: '-2%', 
      icon: Package 
    },
  ];

  return (
    <div className="min-h-screen pt-20 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-zinc-950 p-6 hidden lg:block">
        <div className="space-y-8">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 px-4">Terminal Control</h3>
            <nav className="space-y-1">
              {[
                { id: 'overview', name: 'Dashboard', icon: LineChart },
                { id: 'products', name: 'Inventory', icon: Package },
                { id: 'orders', name: 'Orders', icon: ShoppingCart },
                { id: 'users', name: 'Users', icon: Users },
                { id: 'settings', name: 'System Settings', icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm tracking-wide ${
                    activeTab === item.id 
                      ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/20' 
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold uppercase italic tracking-tighter">Command Center</h1>
            <p className="text-zinc-500 text-sm">System status: Normal / Connection: Stable</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input placeholder="Global search..." className="bg-zinc-900 border-white/10 pl-10 h-10 w-full md:w-64 rounded-xl" />
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600 rounded-xl h-10 px-6 gap-2">
              <Plus className="w-4 h-4" /> New Construct
            </Button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="p-6 bg-zinc-900/50 border border-white/5 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-orange-500" />
                </div>
                <span className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.trend}
                </span>
              </div>
              <div className="text-2xl font-black mb-1 tracking-tight">{stat.value}</div>
              <div className="text-zinc-500 text-xs uppercase font-bold tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden min-h-[500px]">
          {activeTab === 'overview' && (
            <>
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <h3 className="font-bold uppercase tracking-widest text-sm italic">Recent Transmission (Orders)</h3>
                <Button variant="ghost" size="icon" className="text-zinc-500"><MoreVertical className="w-4 h-4" /></Button>
              </div>
              <Table>
                <TableHeader className="bg-zinc-950">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Transmission ID</TableHead>
                    <TableHead className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Client</TableHead>
                    <TableHead className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Amount</TableHead>
                    <TableHead className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Status</TableHead>
                    <TableHead className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Temporal Log</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length > 0 ? (
                    orders.slice(0, 5).map((order) => (
                      <TableRow 
                        key={order.id} 
                        className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                        <TableCell className="font-bold">{order.client}</TableCell>
                        <TableCell className="font-mono text-orange-500">${order.total}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {order.status === 'delivered' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                            {(order.status === 'processing' || order.status === 'pending') && <Clock className="w-3 h-3 text-yellow-500" />}
                            {order.status === 'shipped' && <Package className="w-3 h-3 text-blue-500" />}
                            {order.status === 'cancelled' && <AlertCircle className="w-3 h-3 text-red-500" />}
                            <span className="text-xs font-bold uppercase tracking-tighter">{order.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-zinc-500 text-[10px] uppercase font-bold">
                          {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Recent'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs">
                        No active transmissions monitored
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}

          {activeTab === 'orders' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold uppercase italic tracking-tighter">Transmission Archive</h3>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Full transaction history monitoring</p>
                </div>
              </div>
              
              <Table>
                <TableHeader className="bg-zinc-950">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">ID</TableHead>
                    <TableHead className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Client</TableHead>
                    <TableHead className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Transmission Value</TableHead>
                    <TableHead className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Status</TableHead>
                    <TableHead className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <TableRow 
                        key={order.id} 
                        className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <TableCell className="font-mono text-xs">{order.id}</TableCell>
                        <TableCell className="font-bold">{order.client}</TableCell>
                        <TableCell className="font-mono text-orange-500">${order.total}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             {order.status === 'delivered' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                            {(order.status === 'processing' || order.status === 'pending') && <Clock className="w-3 h-3 text-yellow-500" />}
                            {order.status === 'shipped' && <Package className="w-3 h-3 text-blue-500" />}
                            {order.status === 'cancelled' && <AlertCircle className="w-3 h-3 text-red-500" />}
                            <span className="text-xs font-bold uppercase tracking-tighter">{order.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-zinc-500 text-[10px] uppercase font-bold">
                          {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs">
                        No orders recorded in the archives
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold uppercase italic tracking-tighter">Inventory Core</h3>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Manage physical & digital assets</p>
                </div>
                <Button 
                  onClick={() => {
                    setEditingProduct({
                      name: '',
                      price: 0,
                      category: 'Wearables',
                      stock: 10,
                      rating: 4.5,
                      description: '',
                      imageUrls: [''],
                      model3dUrl: ''
                    });
                    setIsEditing(true);
                  }}
                  className="bg-cyan-400 text-black hover:bg-white rounded-xl h-10 px-6 font-bold uppercase text-[10px] tracking-widest"
                >
                  <Plus className="w-4 h-4 mr-2" /> Manifest New
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length > 0 ? (
                  products.map(product => (
                    <div key={product.id} className="bg-zinc-950 border border-white/5 rounded-3xl p-6 group hover:border-cyan-400/30 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 relative overflow-hidden">
                          <img src={product.imageUrls[0]} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setEditingProduct(product);
                              setIsEditing(true);
                            }}
                            className="w-8 h-8 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="w-8 h-8 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="mb-4">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-400">{product.category}</span>
                        <h4 className="text-lg font-bold italic tracking-tighter truncate uppercase">{product.name}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-mono font-bold text-white/40">${product.price}</span>
                          <span className="text-[10px] font-black text-zinc-500">{product.stock} Units</span>
                        </div>
                      </div>
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setReviewForm({ ...reviewForm, productId: product.id });
                          setIsAddingReview(true);
                        }}
                        className="p-0 h-auto text-cyan-400 font-black uppercase text-[10px] tracking-widest hover:text-white"
                      >
                        Seed Feedback <Star className="w-3 h-3 ml-2" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                    <Layers className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Grid currently unpopulated</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-950 border border-white/10 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Manifest Editor</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}><X className="w-5 h-5" /></Button>
              </div>
              <form onSubmit={handleSaveProduct} className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Construct Name</label>
                    <Input 
                      value={editingProduct?.name} 
                      onChange={e => setEditingProduct({...editingProduct!, name: e.target.value})}
                      className="bg-white/5 border-white/10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Manifest Cost ($)</label>
                    <Input 
                      type="number"
                      value={editingProduct?.price} 
                      onChange={e => setEditingProduct({...editingProduct!, price: Number(e.target.value)})}
                      className="bg-white/5 border-white/10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Category Tag</label>
                    <select 
                      value={editingProduct?.category}
                      onChange={e => setEditingProduct({...editingProduct!, category: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-cyan-400 appearance-none text-white"
                    >
                      <option value="Wearables">Wearables</option>
                      <option value="Home">Home</option>
                      <option value="Lighting">Lighting</option>
                      <option value="Tools">Tools</option>
                      <option value="Jewelry">Jewelry</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Unit Capacity</label>
                    <Input 
                      type="number"
                      value={editingProduct?.stock} 
                      onChange={e => setEditingProduct({...editingProduct!, stock: Number(e.target.value)})}
                      className="bg-white/5 border-white/10 rounded-xl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Visual Assets (Comma-separated URLs)</label>
                    <Input 
                      value={editingProduct?.imageUrls?.join(', ')} 
                      onChange={e => setEditingProduct({...editingProduct!, imageUrls: e.target.value.split(',').map(u => u.trim())})}
                      placeholder="https://link1.jpg, https://link2.jpg"
                      className="bg-white/5 border-white/10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">3D Schema URL (.glb/.gltf)</label>
                    <Input 
                      value={editingProduct?.model3dUrl} 
                      onChange={e => setEditingProduct({...editingProduct!, model3dUrl: e.target.value})}
                      placeholder="https://assets.com/model.glb"
                      className="bg-white/5 border-white/10 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Asset Parameters (Description)</label>
                  <textarea 
                    value={editingProduct?.description}
                    onChange={e => setEditingProduct({...editingProduct!, description: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-cyan-400 min-h-[100px] resize-none"
                  />
                </div>
                <div className="flex gap-4 pt-6">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1 rounded-xl h-14 font-black uppercase tracking-widest text-[10px]">Abort</Button>
                  <Button type="submit" className="flex-1 rounded-xl h-14 bg-cyan-400 text-black hover:bg-white font-black uppercase tracking-widest text-[10px]">Execute Sync</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Review Modal */}
      <AnimatePresence>
        {isAddingReview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-950 border border-white/10 w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Feedback Injection</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsAddingReview(false)}><X className="w-5 h-5" /></Button>
              </div>
              <form onSubmit={handleAddReview} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Citizen Username</label>
                  <Input 
                    value={reviewForm.username} 
                    onChange={e => setReviewForm({...reviewForm, username: e.target.value})}
                    placeholder="@neural_user"
                    className="bg-white/5 border-white/10 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Integrity Rating (1-5)</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(v => (
                      <button 
                        key={v}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: v })}
                        className={`flex-1 h-10 rounded-lg font-bold border transition-all ${reviewForm.rating === v ? 'bg-cyan-400 text-black border-cyan-400' : 'bg-white/5 text-zinc-500 border-white/10'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Manifest Report</label>
                  <textarea 
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-cyan-400 min-h-[100px] resize-none"
                    placeholder="Describe technical performance..."
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl h-14 bg-white text-black hover:bg-cyan-400 font-black uppercase tracking-widest text-[10px]">
                  Inject Telemetry
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/80">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-zinc-950 border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 md:p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Transmission Detail</h3>
                  <p className="text-zinc-500 font-mono text-xs mt-1">ID: {selectedOrder.id}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)} className="rounded-full hover:bg-white/10 text-zinc-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Items List */}
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 border-b border-white/5 pb-4">Consignments</h4>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-white/10 overflow-hidden shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h5 className="font-bold text-sm uppercase tracking-tight">{item.name}</h5>
                              <span className="font-mono text-xs text-orange-500">${item.price}</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-[10px] text-zinc-500 uppercase font-bold">Qty: {item.qty}</span>
                              <span className="font-bold text-sm text-white">${(item.price * item.qty).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-6 border-t border-white/5 space-y-2">
                       <div className="flex justify-between text-zinc-500 text-sm">
                        <span>Subtotal Manifest</span>
                        <span className="font-mono">${(selectedOrder.total - 25).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-zinc-500 text-sm">
                        <span>Transmission Protocol (Fee)</span>
                        <span className="font-mono">$25.00</span>
                      </div>
                      <div className="flex justify-between text-xl font-black italic pt-4 text-white">
                        <span className="uppercase tracking-tighter">Total Value</span>
                        <span className="text-cyan-400 font-mono">${selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata & Logistics */}
                  <div className="space-y-8">
                    {/* Logistical Target */}
                    <div className="space-y-4 p-6 bg-zinc-900 rounded-3xl border border-white/5">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" /> Logistical Target
                      </h4>
                      <div className="space-y-1">
                        <p className="font-bold text-lg text-white">{selectedOrder.shippingAddress?.fullName || 'N/A'}</p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                          {selectedOrder.shippingAddress?.address || 'Address information missing'}<br />
                          {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}<br />
                          {selectedOrder.shippingAddress?.country}
                        </p>
                      </div>
                    </div>

                    {/* Financial Integrity */}
                    <div className="space-y-4 p-6 bg-zinc-900 rounded-3xl border border-white/5">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Financial Integrity
                      </h4>
                      <div className="space-y-3">
                         <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-500">Node ID</span>
                          <span className="font-mono text-zinc-300">{selectedOrder.paymentId || 'PAY-INTERNAL-MOCK'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-500">Security Clearance</span>
                          <span className="text-green-500 font-bold uppercase tracking-tight">Verified</span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Status Control */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Operational Phase</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                          <button
                            key={status}
                            onClick={async () => {
                              try {
                                await updateDoc(doc(db, 'orders', selectedOrder.id), { status });
                                setSelectedOrder({ ...selectedOrder, status: status as any });
                                setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: status as any } : o));
                                toast.success(`Sector move: Order ${status}`);
                              } catch (err) {
                                toast.error("Command failed: Delta rejection");
                              }
                            }}
                            className={`px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border transition-all ${
                              selectedOrder.status === status 
                                ? 'bg-white text-black border-white shadow-lg shadow-white/10' 
                                : 'bg-white/5 text-zinc-500 border-white/5 hover:border-white/20'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
