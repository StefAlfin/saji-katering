import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto w-full p-4 py-8"
    >
      {children}
    </motion.div>
  );
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [eventDate, setEventDate] = useState('');
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCartItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [user]);

  const updateQuantity = async (id: number, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    try {
      await fetch(`/api/cart/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQty })
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (id: number) => {
    try {
      await fetch(`/api/cart/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) return;
    try {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    if (!address.trim()) {
      alert('Tolong masukkan alamat pengiriman.');
      return;
    }
    if (!eventDate) {
      alert('Tolong masukkan tanggal acara.');
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ address, event_date: eventDate })
      });
      if (res.ok) {
        alert('Pesanan berhasil dibuat!');
        navigate('/dashboard');
      } else {
        const error = await res.json();
        alert(error.error || 'Gagal checkout');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <PageTransition>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-orange-600" />
          <h1 className="text-3xl font-bold text-neutral-900">Keranjang Pesanan</h1>
        </div>
        {cartItems.length > 0 && (
          <button 
            onClick={clearCart}
            className="text-red-600 border border-red-200 hover:bg-red-50 bg-white px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center"
          >
            Kosongkan Keranjang
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-neutral-200 text-center shadow-sm">
          <p className="text-neutral-500 mb-6 text-lg">Keranjang Anda masih kosong.</p>
          <button 
            onClick={() => navigate('/#menus')}
            className="bg-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-700 transition"
          >
            Lihat Menu Katering
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-neutral-200 flex items-center gap-4 shadow-sm">
                <div className="w-24 h-24 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">No img</div>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-lg text-neutral-900">{item.name}</h3>
                  <p className="text-orange-600 font-semibold mt-1">Rp {item.price.toLocaleString('id-ID')}</p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center bg-neutral-100 rounded-lg">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity, -1)}
                        className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 rounded-l-lg"
                      >-</button>
                      <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity, 1)}
                        className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 rounded-r-lg"
                      >+</button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-2 text-sm flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Hapus
                    </button>
                  </div>
                </div>
                <div className="hidden sm:block text-right self-end font-bold text-lg">
                  Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-4">Ringkasan</h2>
              <div className="flex justify-between mb-2 text-neutral-600">
                <span>Total Item</span>
                <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between mb-6 text-neutral-600">
                <span>Subtotal</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <div className="border-t border-neutral-200 pt-4 mb-6">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Tagihan</span>
                  <span className="text-orange-600">Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Tanggal Acara</label>
                <input 
                  type="datetime-local"
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm mb-4"
                  required
                />
                <label className="block text-sm font-medium text-neutral-700 mb-2">Alamat Pengiriman</label>
                <textarea 
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Masukkan alamat lengkap..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm min-h-[80px]"
                  required
                />
              </div>

              <button 
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition disabled:opacity-70"
              >
                {checkoutLoading ? 'Memproses...' : 'Buat Pesanan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
