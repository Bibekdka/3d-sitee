import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ShoppingCart, 
  Eye, 
  X, 
  ChevronDown,
  Star,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from '@/components/ui/separator';
import { addToWishlist, removeFromWishlist, getWishlist } from '@/services/wishlistService';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrls: string[];
  stock: number;
  rating: number;
  createdAt?: any;
}

type SortOption = 'newest' | 'price-low' | 'price-high' | 'rating';

const ITEMS_PER_PAGE = 12;

/**
 * Shop Page Component
 * Renders the marketplace where users can browse, filter, and add constructs to their cart.
 */
export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [sortOrder, setSortOrder] = useState<SortOption>('newest');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    /**
     * Fetches current user's wishlist IDs
     */
    const fetchWishlistIds = async () => {
      try {
        const ids = await getWishlist();
        setWishlist(ids);
      } catch (err) {
        console.error("Wishlist fetch error:", err);
      }
    };
    fetchWishlistIds();

    /**
     * Fetches all products from the catalog
     */
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        const productList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productList);
      } catch (err) {
        console.error("Catalog access failure:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ['All', 'Wearables', 'Home', 'Lighting', 'Tools', 'Jewelry', 'Accessories'];

  /**
   * Computes filtered and sorted products based on current UI state
   */
  const filteredAndSortedProducts = useMemo(() => {
    // Reset to page 1 when criteria change
    setCurrentPage(1);

    let result = products.filter(p => 
      (activeCategory === 'All' || p.category === activeCategory) &&
      (p.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (p.price >= priceRange[0] && p.price <= priceRange[1]) &&
      (p.rating >= minRating)
    );

    switch (sortOrder) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        // Firestore handles newest by default via query
        break;
    }

    return result;
  }, [products, searchTerm, activeCategory, priceRange, minRating, sortOrder]);

  /**
   * Calculate paginated products
   */
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedProducts, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);

  const resetFilters = () => {
    setActiveCategory('All');
    setPriceRange([0, 500]);
    setMinRating(0);
    setSearchTerm('');
  };

  /**
   * Toggles an item in/out of the user's wishlist
   */
  const handleToggleWishlist = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (wishlist.includes(id)) {
        await removeFromWishlist(id);
        setWishlist(prev => prev.filter(item => item !== id));
        toast.info("Removed from reserve");
      } else {
        await addToWishlist(id);
        setWishlist(prev => [...prev, id]);
        toast.success("Added to reserve");
      }
    } catch (err) {
      toast.error("Wishlist Update Protocol Failed");
    }
  };

  /**
   * Quick-add a product to the cart with default configuration
   */
  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.imageUrls[0],
      variant: 'Standard',
      finish: 'Matte Noir'
    });
    
    toast.success(`${product.name} added to cart`, {
      description: "Default configuration applied."
    });
  };

  const activeFilterCount = (activeCategory !== 'All' ? 1 : 0) + 
                             (priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0) + 
                             (minRating > 0 ? 1 : 0);

  return (
    <div className="min-h-screen pt-32 pb-20 px-10 max-w-7xl mx-auto relative z-10">
      {/* Page Header Area */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 mb-16 items-start lg:items-end">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] uppercase tracking-[0.2em] font-bold text-cyan-400 mb-6 font-mono">
            Accessing Central Index: Marketplace
          </div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-4">Marketplace</h1>
          <p className="text-white/40 max-w-lg leading-relaxed font-medium">Premium 3D printed constructs, designed by visionaries, manufactured for reality with precision metrics.</p>
        </div>
        
        {/* Search & Main Controls */}
        <div className="lg:col-span-5 w-full flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input 
              placeholder="Search constructs..." 
              className="bg-white/5 border-white/10 pl-10 w-full h-12 rounded-xl focus:ring-1 focus:ring-cyan-500 transition-all font-medium text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="outline" className="border-white/10 bg-white/5 h-12 rounded-xl px-4 flex items-center gap-2 text-white/60 hover:text-white hover:bg-white/10">
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Sort</span>
                </Button>
              } />
              <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-white w-48">
                <DropdownMenuItem onClick={() => setSortOrder('newest')} className="focus:bg-white/10">Newest Arrival</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('price-low')} className="focus:bg-white/10">Price: Low to High</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('price-high')} className="focus:bg-white/10">Price: High to Low</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('rating')} className="focus:bg-white/10">Top Rated</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Sheet */}
            <Sheet>
              <SheetTrigger render={
                <Button variant="outline" className="border-white/10 bg-white/5 h-12 rounded-xl px-4 flex items-center gap-2 text-white/60 hover:text-white hover:bg-white/10 relative">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full text-[10px] text-black font-bold flex items-center justify-center border-2 border-zinc-950">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              } />
              <SheetContent className="bg-zinc-950/95 border-l border-white/10 text-white backdrop-blur-xl p-8 overflow-y-auto">
                <SheetHeader className="mb-10">
                  <SheetTitle className="text-2xl font-black italic uppercase italic text-white tracking-tight">Advanced Filtering</SheetTitle>
                  <SheetDescription className="text-white/40">Refine the marketplace parameters.</SheetDescription>
                </SheetHeader>

                <div className="space-y-12">
                  {/* Category Filter */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 font-mono">Core Categories</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`h-10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${
                            activeCategory === cat 
                              ? 'bg-cyan-400 text-black border-cyan-400' 
                              : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Slider */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 font-mono">Price Manifest ($)</h3>
                      <span className="text-xs font-mono text-white/60">${priceRange[0]} - ${priceRange[1]}</span>
                    </div>
                    <Slider
                      defaultValue={[0, 500]}
                      max={1000}
                      step={10}
                      value={priceRange}
                      onValueChange={(val) => setPriceRange(val as number[])}
                      className="py-4"
                    />
                  </div>

                  {/* Rating Filter */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 font-mono">Minimum Integrity</h3>
                    <div className="flex gap-2">
                      {[0, 2, 3, 4].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setMinRating(rating)}
                          className={`flex-1 h-10 rounded-lg border transition-all flex items-center justify-center gap-1 ${
                            minRating === rating 
                              ? 'bg-cyan-400 text-black border-cyan-400' 
                              : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <span className="text-xs font-bold">{rating === 0 ? 'All' : `${rating}+`}</span>
                          {rating > 0 && <Star className="w-3 h-3 fill-current" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-white/5" />

                  <Button 
                    className="w-full h-14 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all"
                    onClick={resetFilters}
                  >
                    Reset All Protocols
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Horizontal Category Quick-Bar */}
      <div className="flex flex-wrap gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-8 h-10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border whitespace-nowrap ${
              activeCategory === cat 
                ? 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]' 
                : 'bg-white/5 text-white/40 hover:text-white border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mb-8 flex items-center justify-between">
        <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
          Scanning Index: {filteredAndSortedProducts.length} constructs found within parameters
        </p>
      </div>

      {/* 
        PRODUCT GRID AREA
        Controls the display of all filtered construct cards.
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <AnimatePresence mode="popLayout">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="group relative bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-cyan-500/30 transition-all duration-500 backdrop-blur-sm shadow-xl"
              >
                {/* 
                  VISUAL PREVIEW NODE 
                  Renders the main product image.
                */}
                <div className="aspect-square overflow-hidden relative border-b border-white/5 bg-zinc-900/40">
                  {/* MAIN IMAGE: This is where the primary product photo is displayed */}
                  <img 
                    src={product.imageUrls[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <Button 
                      onClick={(e) => handleToggleWishlist(product.id, e)}
                      title="Reserve Unit"
                      className={`rounded-full w-14 h-14 shadow-2xl transition-all scale-90 group-hover:scale-100 ${wishlist.includes(product.id) ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-red-500 hover:text-white'}`}
                    >
                      <Heart className={`w-6 h-6 ${wishlist.includes(product.id) ? 'fill-current' : ''}`} />
                    </Button>
                    <Link to={`/product/${product.id}`}>
                      <Button title="Analyze Detailed Specs" className="bg-white text-black hover:bg-cyan-400 rounded-full w-14 h-14 shadow-2xl transition-all scale-90 group-hover:scale-100">
                        <Eye className="w-6 h-6" />
                      </Button>
                    </Link>
                    <Button 
                      onClick={(e) => handleQuickAdd(product, e)}
                      title="Initialize Assembly"
                      className="bg-white text-black hover:bg-orange-500 rounded-full w-14 h-14 shadow-2xl transition-all scale-90 group-hover:scale-100 hover:text-white"
                    >
                      <ShoppingCart className="w-6 h-6" />
                    </Button>
                  </div>
                  
                  {/* Floating Price Indicator */}
                  <div className="absolute top-6 right-6 font-mono text-xl font-bold text-white tracking-tighter bg-black/40 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
                    ${product.price}
                  </div>
                </div>
                
                {/* 
                  PRODUCT METADATA 
                  Controls text labels and rating markers.
                */}
                <div className="p-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 italic font-mono">{product.category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_5px_cyan]" />
                      <span className="text-xs font-mono font-bold text-white/60">{product.rating}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2 group-hover:text-cyan-400 transition-colors leading-none">
                    {product.name}
                  </h3>
                  <p className="text-white/30 text-sm font-medium">Materialization ready: Premium carbon-composite.</p>
                </div>
              </motion.div>
            ))
          ) : (
            /* Empty State for Filters */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-32 text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 border border-white/10 rounded-full mb-6">
                <X className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">No Constructs Found</h3>
              <p className="text-white/40 font-medium tracking-wide">Adjust search parameters to find matching archived entries.</p>
              <Button 
                variant="link" 
                className="text-cyan-400 uppercase tracking-[0.2em] font-black text-[10px] mt-4"
                onClick={resetFilters}
              >
                Clear All Filter Buffers
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 
        PAGINATION CONTROLS
        Provides navigation between product batches.
      */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8 border-t border-white/5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="w-12 h-12 rounded-xl text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 border border-white/5"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant="ghost"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-12 h-12 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                    currentPage === pageNum 
                      ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {String(pageNum).padStart(2, '0')}
                </Button>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="w-12 h-12 rounded-xl text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 border border-white/5"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}

