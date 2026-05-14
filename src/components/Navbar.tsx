import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, UserCog, ChefHat } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user?.role === 'user' && token) {
      fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
          setCartCount(data.reduce((acc, curr) => acc + curr.quantity, 0));
        }
      })
      .catch(console.error);
    }
  }, [user, token]);

  // Periodic poll for cart just to keep sync in this demo
  useEffect(() => {
    if (user?.role !== 'user' || !token) return;
    const int = setInterval(() => {
      fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
          setCartCount(data.reduce((acc, curr) => acc + curr.quantity, 0));
        }
      })
      .catch(() => {});
    }, 5000);
    return () => clearInterval(int);
  }, [user, token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-200 z-50 flex items-center px-4 md:px-8">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight text-orange-600 flex items-center gap-2 group">
          <div className="flex items-center justify-center p-0.5 rounded-lg group-hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Saji Katering Logo" className="w-14 h-14 object-contain" />
          </div>
          <span>SajiKatering</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-6">
          <Link to="/" className="text-sm font-medium hover:text-orange-600 transition-colors">Menu</Link>
          <Link to="/promo" className="text-sm font-medium hover:text-orange-600 transition-colors">Promo</Link>
          <Link to="/about" className="text-sm font-medium hover:text-orange-600 transition-colors">Tentang Kami</Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              {user.role === 'admin' ? (
                <Link to="/admin" className="flex items-center gap-2 text-sm font-medium hover:text-orange-600">
                  <UserCog className="w-5 h-5" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              ) : (
                <>
                  <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-orange-600">
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline">Pesanan Saya</span>
                  </Link>
                  <Link to="/cart" className="relative flex items-center text-sm font-medium hover:text-orange-600">
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
                className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-red-600 transition-colors ml-2"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                to="/login"
                className="text-sm font-medium bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700 transition"
              >
                Masuk
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
