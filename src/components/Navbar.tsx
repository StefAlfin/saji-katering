import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, UserCog, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AnimatePresence, motion } from 'motion/react';

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menus?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/menus`);
    }
  };

  const updateCartCount = () => {
    if (user && user.role === 'admin') return;
    try {
      const cart = JSON.parse(localStorage.getItem('saji_cart') || '[]');
      setCartCount(cart.reduce((acc: number, curr: any) => acc + curr.quantity, 0));
    } catch (e) {
      console.error(e);
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('cart-updated', updateCartCount);
    // Removed polling since localStorage emits event on other tabs and we just update explicitly here
    return () => {
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-20 bg-[var(--color-warm-white)]/90 backdrop-blur-md border-b-2 border-neutral-200/50 z-50 flex items-center px-4 md:px-8">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-serif font-bold tracking-tight text-[var(--color-earth-dark)] flex items-center gap-3 group hidden lg:flex">
            <div className="flex items-center justify-center p-0.5 rounded-lg group-hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Saji Katering Logo" className="w-12 h-12 object-contain" />
            </div>
            <span>Saji Katering</span>
          </Link>
          <Link to="/" className="lg:hidden text-2xl font-serif font-bold tracking-tight text-[var(--color-earth-dark)] flex items-center gap-2 group">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          </Link>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/" className="uppercase tracking-[0.1em] text-[10px] font-semibold text-neutral-500 hover:text-[var(--color-olive)] transition-colors hidden lg:block">Beranda</Link>
            <Link to="/menus" className="uppercase tracking-[0.1em] text-[10px] font-semibold text-neutral-500 hover:text-[var(--color-olive)] transition-colors hidden lg:block">Menu</Link>
            <Link to="/promo" className="uppercase tracking-[0.1em] text-[10px] font-semibold text-neutral-500 hover:text-[var(--color-olive)] transition-colors hidden lg:block">Promo</Link>
            <Link to="/reviews" className="uppercase tracking-[0.1em] text-[10px] font-semibold text-neutral-500 hover:text-[var(--color-olive)] transition-colors hidden lg:block">Penilaian</Link>
            <Link to="/contact" className="uppercase tracking-[0.1em] text-[10px] font-semibold text-neutral-500 hover:text-[var(--color-olive)] transition-colors hidden lg:block">Kontak</Link>
            
            {user ? (
              <div className="hidden sm:flex items-center gap-5 border-l border-neutral-300 pl-6 ml-2">
                {user.role === 'admin' ? (
                  <Link to="/admin" className="flex items-center gap-2 text-sm font-medium text-[var(--color-earth-dark)] hover:opacity-70 transition-opacity">
                    <UserCog className="w-5 h-5" />
                    <span className="hidden lg:inline uppercase tracking-widest text-[10px] font-semibold">Admin</span>
                  </Link>
                ) : (
                  <>
                    <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium text-[var(--color-earth-dark)] hover:opacity-70 transition-opacity">
                      <User className="w-5 h-5" />
                      <span className="hidden lg:inline uppercase tracking-[0.1em] text-[10px] font-semibold mt-0.5">Pesanan Saya</span>
                    </Link>
                    <Link to="/cart" className="relative flex items-center text-sm font-medium text-[var(--color-earth-dark)] hover:opacity-70 transition-opacity">
                      <ShoppingCart className="w-5 h-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-red-800 transition-colors ml-2"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-4 ml-4">
                <Link 
                  to="/login"
                  className="uppercase tracking-[0.1em] text-[10px] font-semibold bg-[var(--color-earth-dark)] text-white px-6 py-2.5 rounded-full hover:bg-[var(--color-olive)] transition"
                >
                  Masuk
                </Link>
              </div>
            )}

            {user && user.role !== 'admin' && (
              <Link to="/cart" className="relative sm:hidden flex items-center text-sm font-medium text-[var(--color-earth-dark)] hover:opacity-70 transition-opacity ml-2">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            <button 
              className="lg:hidden p-2 text-neutral-600"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-20 right-0 bottom-0 w-72 bg-[var(--color-warm-white)] z-40 shadow-2xl lg:hidden flex flex-col p-6 border-l border-neutral-200/50"
            >
              <div className="flex flex-col gap-6 font-medium text-neutral-600 uppercase tracking-widest text-[11px] mt-4">
                <Link to="/" className="hover:text-[var(--color-olive)] transition-colors">Beranda</Link>
                <Link to="/menus" className="hover:text-[var(--color-olive)] transition-colors">Menu</Link>
                <Link to="/promo" className="hover:text-[var(--color-olive)] transition-colors">Promo</Link>
                <Link to="/reviews" className="hover:text-[var(--color-olive)] transition-colors">Penilaian</Link>
                <Link to="/contact" className="hover:text-[var(--color-olive)] transition-colors">Kontak</Link>
              </div>

              <div className="mt-auto pt-8 border-t border-neutral-200/50">
                {user ? (
                  <div className="flex flex-col gap-5">
                    <p className="text-sm font-serif italic text-neutral-500 mb-2 truncate text-lg">Salam, {user.name}</p>
                    {user.role === 'admin' ? (
                      <Link to="/admin" className="flex items-center gap-3 text-[var(--color-earth-dark)] hover:opacity-70 transition-opacity uppercase tracking-widest text-[11px] font-semibold">
                        <UserCog className="w-5 h-5 flex-shrink-0" />
                        <span>Dasbor Admin</span>
                      </Link>
                    ) : (
                      <Link to="/dashboard" className="flex items-center gap-3 text-[var(--color-earth-dark)] hover:opacity-70 transition-opacity uppercase tracking-widest text-[11px] font-semibold">
                        <User className="w-5 h-5 flex-shrink-0" />
                        <span>Pesanan Saya</span>
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-3 py-3 text-[#5A5A40] border border-[#5A5A40] rounded-full mt-6 hover:bg-[#5A5A40] hover:text-white transition uppercase tracking-widest text-[10px] font-bold"
                    >
                      <LogOut className="w-4 h-4 flex-shrink-0" />
                      <span>Keluar</span>
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/login"
                    className="w-full flex justify-center py-4 bg-[var(--color-earth-dark)] text-white rounded-full hover:bg-[var(--color-olive)] transition tracking-widest text-[11px] font-bold uppercase"
                  >
                    Mulai Bersantap
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

