import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star, ShoppingBag, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Menus() {
  const [menus, setMenus] = useState<any[]>([]);
  const [wishlists, setWishlists] = useState<any[]>([]);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const [categoryFilter, setCategoryFilter] = useState('');

  const categories = Array.from(new Set(menus.map(m => m.category).filter(Boolean)));

  const filteredMenus = menus.filter(menu => {
    const matchSearch = !searchQuery || (
      menu.name?.toLowerCase().includes(searchQuery) ||
      menu.description?.toLowerCase().includes(searchQuery) ||
      menu.category?.toLowerCase().includes(searchQuery)
    );
    const matchCategory = !categoryFilter || menu.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const [selectedMenu, setSelectedMenu] = useState<any | null>(null);
  const [menuReviews, setMenuReviews] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openDetails = async (menu: any) => {
    setSelectedMenu(menu);
    setIsModalOpen(true);
    try {
      const res = await fetch(`/api/reviews/menu/${menu.id}`);
      const data = await res.json();
      setMenuReviews(data);
    } catch (e) {
      console.error('Error fetching reviews:', e);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMenu(null);
    setMenuReviews([]);
  };

  useEffect(() => {
    fetch('/api/menus')
      .then(r => r.json())
      .then(setMenus)
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

  const addToCart = (menu: any) => {
    if (user?.role === 'admin') return; 
    
    try {
      const existingCart = JSON.parse(localStorage.getItem('saji_cart') || '[]');
      const existingItem = existingCart.find((item: any) => item.menu_id === menu.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        existingCart.push({
          id: Date.now(), // unique id for cart item, optional but matches previous cart item id
          menu_id: menu.id,
          name: menu.name,
          price: menu.price,
          image_url: menu.image_url,
          quantity: 1
        });
      }
      
      localStorage.setItem('saji_cart', JSON.stringify(existingCart));
      alert('Ditambahkan ke keranjang!');
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col flex-grow py-12 px-4 bg-white"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">
            Pilihan Menu Spesial
          </h2>
          <p className="mt-4 text-neutral-500">
            Dibuat dari bahan segar berkualitas tinggi setiap hari.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <input
            type="text"
            placeholder="Cari nama menu atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchParams(e.target.value ? { search: e.target.value } : {})}
            className="border border-neutral-300 rounded-full px-6 py-3 w-full md:w-1/3 focus:outline-none focus:border-orange-500 font-light"
          />
          <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2">
            <button 
              onClick={() => setCategoryFilter('')} 
              className={`flex-shrink-0 px-6 py-2 rounded-full border transition-colors text-sm ${!categoryFilter ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-neutral-600 border-neutral-300 hover:border-orange-600'}`}
            >
              Semua Kategori
            </button>
            {categories.map((c: any) => (
              <button 
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`flex-shrink-0 px-6 py-2 rounded-full border transition-colors text-sm ${categoryFilter === c ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-neutral-600 border-neutral-300 hover:border-orange-600'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        
        {filteredMenus.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-neutral-100">
            <p className="text-neutral-500 mb-4">Tidak ada menu yang sesuai dengan pencarian Anda.</p>
            <button 
              onClick={() => navigate('/menus')}
              className="text-orange-600 font-medium hover:underline"
            >
              Lihat semua menu
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl overflow-hidden card-shadow mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-orange-600 text-white text-sm uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4 font-medium">Menu</th>
                    <th className="px-6 py-4 font-medium">Kategori</th>
                    <th className="px-6 py-4 font-medium">Rating</th>
                    <th className="px-6 py-4 font-medium">Harga</th>
                    <th className="px-6 py-4 font-medium text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 p-2">
                  {filteredMenus.map((menu, i) => (
                    <motion.tr 
                      key={menu.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {menu.image_url ? (
                            <img src={menu.image_url} alt={menu.name} className="w-16 h-16 rounded-xl object-cover bg-neutral-200" />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-neutral-200 flex items-center justify-center text-xs text-neutral-400">No Image</div>
                          )}
                          <div>
                            <p className="font-serif text-lg font-medium text-neutral-900">{menu.name}</p>
                            <p className="text-sm font-light text-neutral-500 line-clamp-1 max-w-xs">{menu.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="bg-orange-50 text-orange-700 text-xs px-3 py-1 rounded-full border border-orange-100 font-medium">
                          {menu.category || 'Reguler'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {menu.review_count > 0 ? (
                          <div className="flex items-center gap-1">
                             <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                             <span className="text-sm font-semibold text-neutral-700">{Number(menu.avg_rating).toFixed(1)}</span>
                             <span className="text-xs text-neutral-400 ml-1">({menu.review_count})</span>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-400">Belum ada rating</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-orange-600 whitespace-nowrap">Rp {menu.price.toLocaleString('id-ID')}</p>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center justify-center gap-2">
                           {user?.role !== 'admin' && (
                             <>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); toggleWishlist(menu.id); }} 
                                 className="text-neutral-400 hover:text-red-500 transition-colors p-2 bg-white rounded-full border shadow-sm"
                                 title="Wishlist"
                               >
                                 <Heart className={`w-4 h-4 transition-colors ${wishlists.some(w => w.id === menu.id) ? 'fill-red-500 text-red-500' : ''}`} />
                               </button>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); addToCart(menu); }}
                                 className="bg-orange-100 text-orange-700 p-2 rounded-full hover:bg-orange-200 transition-colors border shadow-sm"
                                 title="Tambah ke Keranjang"
                               >
                                 <ShoppingBag className="w-4 h-4" />
                               </button>
                             </>
                           )}
                           <button 
                              onClick={() => openDetails(menu)}
                              className="text-xs uppercase tracking-wider bg-neutral-900 hover:bg-black text-white transition py-2 px-4 rounded-full font-semibold whitespace-nowrap shadow-sm"
                           >
                              Detail
                           </button>
                         </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Menu Details Modal */}
      {isModalOpen && selectedMenu && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col md:flex-row"
          >
            {/* Image Section */}
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-neutral-200">
              {selectedMenu.image_url ? (
                <img src={selectedMenu.image_url} alt={selectedMenu.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">No Image</div>
              )}
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 flex flex-col h-full max-h-[60vh] md:max-h-[90vh]">
              <div className="p-6 md:p-8 flex-grow overflow-y-auto">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-bold text-neutral-900">{selectedMenu.name}</h3>
                  <button onClick={closeModal} className="text-neutral-400 hover:text-neutral-600">
                    <span className="sr-only">Close</span>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  {selectedMenu.category}
                </span>

                <div className="flex items-center gap-1 mb-4 text-yellow-400">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-lg font-bold text-neutral-900 ml-1">{Number(selectedMenu.avg_rating).toFixed(1)}</span>
                  <span className="text-sm text-neutral-500">({selectedMenu.review_count} ulasan)</span>
                </div>

                <p className="text-neutral-600 mb-6 leading-relaxed">
                  {selectedMenu.description}
                </p>

                <div className="mb-6">
                  <h4 className="font-bold text-neutral-900 mb-4 border-b pb-2">Ulasan Pelanggan</h4>
                  {menuReviews.length === 0 ? (
                    <p className="text-sm text-neutral-500 italic">Belum ada ulasan untuk menu ini.</p>
                  ) : (
                    <div className="space-y-4">
                      {menuReviews.map((review, idx) => (
                        <div key={idx} className="bg-neutral-50 p-4 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-neutral-900">{review.user_name}</div>
                            <div className="flex text-yellow-400">
                              {Array.from({ length: review.rating }).map((_, j) => (
                                <Star key={j} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-neutral-600">{review.comment || '-'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Footer Actions */}
              <div className="p-6 md:p-8 bg-neutral-50 border-t border-neutral-100 mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-neutral-500">Harga</span>
                  <span className="text-2xl font-bold text-orange-600">Rp {selectedMenu.price.toLocaleString('id-ID')}</span>
                </div>
                {user?.role !== 'admin' && (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        toggleWishlist(selectedMenu.id);
                        if (!user) closeModal();
                      }}
                      className={`flex items-center justify-center p-4 rounded-xl border ${wishlists.some(w => w.id === selectedMenu.id) ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-neutral-200 text-neutral-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50'} transition-colors h-14`}
                    >
                      <Heart className={`w-6 h-6 ${wishlists.some(w => w.id === selectedMenu.id) ? 'fill-current' : ''}`} />
                    </button>
                    <button 
                      onClick={() => {
                        addToCart(selectedMenu.id);
                        if (!user) closeModal();
                      }}
                      className="flex-1 bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition flex items-center justify-center gap-2 h-14"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      Tambah ke Keranjang
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
