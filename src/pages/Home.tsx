import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star, ShoppingBag, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col flex-grow"
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [menus, setMenus] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [wishlists, setWishlists] = useState<any[]>([]);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/menus')
      .then(r => r.json())
      .then(setMenus)
      .catch(console.error);

    fetch('/api/all-reviews')
      .then(r => r.json())
      .then(data => {
        // Map keys to match existing testimonial format or structure
        const mapped = data.map((d: any) => ({
          id: d.id,
          rating: d.rating,
          content: d.comment,
          user_name: d.user_name
        }));
        setTestimonials(mapped);
      })
      .catch(console.error);
      
    if (user && token) {
      fetch('/api/wishlist', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json())
        .then(setWishlists)
        .catch(console.error);
    }
  }, [user, token]);

  const toggleWishlist = async (menuId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ menu_id: menuId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.added) {
          setWishlists([...wishlists, menus.find(m => m.id === menuId)]);
        } else {
          setWishlists(wishlists.filter(w => w.id !== menuId));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = async (menuId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') return; // admins don't order usually
    
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ menu_id: menuId })
      });
      if (res.ok) {
        alert('Ditambahkan ke keranjang!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="bg-orange-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-neutral-900 tracking-tight"
          >
            Sajian <span className="text-orange-600">Terbaik</span> Untuk Setiap Acara Anda
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-lg text-neutral-600 max-w-2xl mx-auto"
          >
            Pesan katering berkualitas, segar, dan lezat dengan mudah. Mulai dari nasi kotak, snack box, hingga prasmanan lengkap.
          </motion.p>
        </div>
      </section>

      {/* Menus Section */}
      <section className="py-20 px-4 bg-white" id="menus">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Pilihan Menu Spesial</h2>
            <p className="mt-4 text-neutral-500">Dibuat dari bahan segar berkualitas tinggi setiap hari.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {menus.map((menu, i) => (
              <motion.div 
                key={menu.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="h-48 bg-neutral-200 relative">
                  {menu.image_url ? (
                    <img src={menu.image_url} alt={menu.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">No Image</div>
                  )}
                  <span className="absolute top-3 left-3 bg-white/90 px-3 py-1 text-xs font-semibold rounded-full text-orange-700">
                    {menu.category}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-neutral-900">{menu.name}</h3>
                    {user?.role !== 'admin' && (
                      <button onClick={() => toggleWishlist(menu.id)} className="text-neutral-400 hover:text-red-500 transition-colors">
                        <Heart className={`w-5 h-5 ${wishlists.some(w => w.id === menu.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                    )}
                  </div>
                  {menu.review_count > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-neutral-700">{Number(menu.avg_rating).toFixed(1)}</span>
                      <span className="text-xs text-neutral-400">({menu.review_count} ulasan)</span>
                    </div>
                  )}
                  <p className="text-sm text-neutral-500 mt-2 flex-grow">{menu.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-orange-600">Rp {menu.price.toLocaleString('id-ID')}</span>
                    {user?.role !== 'admin' && (
                      <button 
                        onClick={() => addToCart(menu.id)}
                        className="bg-orange-100 text-orange-700 p-2 rounded-full hover:bg-orange-200 transition-colors"
                        title="Tambah ke Keranjang"
                      >
                        <ShoppingBag className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Apa Kata Pelanggan Kami</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.length === 0 ? (
              <p className="text-neutral-400 col-span-2 text-center pb-8">Belum ada penilaian dari pelanggan.</p>
            ) : (
              testimonials.map((testi, i) => (
                <motion.div 
                  key={testi.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-neutral-800 p-6 rounded-2xl"
                >
                  <div className="flex gap-1 mb-4 text-yellow-400">
                    {Array.from({ length: testi.rating }).map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-neutral-300 italic mb-4">"{testi.content || 'Tidak ada komentar'}"</p>
                  <p className="font-semibold text-white">— {testi.user_name || 'Pelanggan'}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
