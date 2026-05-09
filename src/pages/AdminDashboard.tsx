import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  AlertCircle
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

export default function AdminDashboard() {
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState('overview');

  // RBAC check
  if (!user || user.role !== 'admin') {
    // return <Navigate to="/" />;
  }

  const stats = [
    { label: 'Total Revenue', value: '$24,500', trend: '+12.5%', icon: LineChart },
    { label: 'Active Orders', value: '156', trend: '+5.2%', icon: ShoppingCart },
    { label: 'Total Users', value: '890', trend: '+18.1%', icon: Users },
    { label: 'Inventory', value: '42', trend: '-2.4%', icon: Package },
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
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden">
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
              {[
                { id: '#GS-9281', client: 'Commander Shepard', amount: '$450.00', status: 'Delivered', time: '2 mins ago' },
                { id: '#GS-9282', client: 'Ellen Ripley', amount: '$120.00', status: 'Processing', time: '15 mins ago' },
                { id: '#GS-9283', client: 'Rick Deckard', amount: '$85.50', status: 'Shipped', time: '1 hour ago' },
                { id: '#GS-9284', client: 'Sarah Connor', amount: '$2,100.00', status: 'Processing', time: '3 hours ago' },
                { id: '#GS-9285', client: 'J. Cooper', amount: '$34.00', status: 'Cancelled', time: 'Yesterday' },
              ].map((order) => (
                <TableRow key={order.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-mono text-xs">{order.id}</TableCell>
                  <TableCell className="font-bold">{order.client}</TableCell>
                  <TableCell className="font-mono text-orange-500">{order.amount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       {order.status === 'Delivered' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                       {order.status === 'Processing' && <Clock className="w-3 h-3 text-yellow-500" />}
                       {order.status === 'Shipped' && <Package className="w-3 h-3 text-blue-500" />}
                       {order.status === 'Cancelled' && <AlertCircle className="w-3 h-3 text-red-500" />}
                       <span className="text-xs font-bold uppercase tracking-tighter">{order.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500 text-[10px] uppercase font-bold">{order.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
