import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import ShowcasePage from './pages/ShowcasePage';
import { Toaster } from '@/components/ui/sonner';
import { useAuthListener } from './hooks/useAuthListener';

import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import LegalPage from './pages/LegalPage';
import WishlistPage from './pages/WishlistPage';

export default function App() {
  useAuthListener();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#050505] text-[#F9F9F9] selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden">
        {/* Animated Background Layers */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/20 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[100px]"></div>
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-cyan-900/10 blur-[80px]"></div>
          <div className="absolute inset-0 bg-grid-pattern"></div>
        </div>

        <Header />
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/showcase" element={<ShowcasePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/privacy" element={<LegalPage title="Privacy Logic" />} />
            <Route path="/terms" element={<LegalPage title="Terms of Service" />} />
          </Routes>
        </main>
        <Footer />
        <Toaster />
      </div>
    </BrowserRouter>
  );
}
