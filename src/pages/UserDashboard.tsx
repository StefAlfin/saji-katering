import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Package, Clock, Star, Edit2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto w-full p-4 py-8"
    >
      {children}
    </motion.div>
  );
}

export default function UserDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState<any>(null); // order details
  const [reviewingMenuId, setReviewingMenuId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const { user, token, login } = useAuth();
  const navigate = useNavigate();

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleEditProfileClick = () => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditPassword('');
      setIsEditingProfile(true);
    }
  };

  const saveProfile = async () => {
    if (!editName.trim()) return alert('Nama tidak boleh kosong');
    setSavingProfile(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: editName, 
          phone: editPhone,
          password: editPassword 
        })
      });
      const data = await res.json();
      if (res.ok) {
        login({ user: data.user, token: data.token });
        alert('Profil berhasil diperbarui!');
        setIsEditingProfile(false);
      } else {
        alert(data.error || 'Terjadi kesalahan');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi');
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'user') {
      navigate('/login');
      return;
    }

    fetchOrders();
  }, [user, token, navigate]);

  const fetchOrderDetails = async (id: number) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActiveOrder(data);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'menunggu': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'diproses': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'dikirim': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'selesai': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const submitReview = async (menuId: number) => {
    if (!rating) return;
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ menu_id: menuId, rating, comment })
      });
      if (res.ok) {
        alert('Ulasan berhasil dikirim!');
        setReviewingMenuId(null);
        setRating(5);
        setComment('');
      } else {
        alert('Terjadi kesalahan.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitOrderReview = async (orderId: number) => {
    if (!rating) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });
      if (res.ok) {
        alert('Penilaian pesanan berhasil dikirim!');
        setRating(5);
        setComment('');
        fetchOrders();
        const oRes = await fetch(`/api/orders/${orderId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (oRes.ok) setActiveOrder(await oRes.json());
      } else {
        alert('Terjadi kesalahan saat mengirim penilaian.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center flex-grow">Loading...</div>;

  return (
    <PageTransition>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard Pesanan Anda</h1>
        <p className="text-neutral-500 mt-2 mb-6">Pantau status pesanan katering terbaru di sini.</p>
        {user && (
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center gap-4 text-sm relative pr-12">
            <div className="flex-1">
              <span className="text-neutral-500 block">Nama Lengkap</span>
              <span className="font-semibold text-neutral-900">{user.name}</span>
            </div>
            <div className="flex-1">
              <span className="text-neutral-500 block">Username</span>
              <span className="font-semibold text-neutral-900">{user.username}</span>
            </div>
            <div className="flex-1">
              <span className="text-neutral-500 block">Email</span>
              <span className="font-semibold text-neutral-900">{user.email}</span>
            </div>
            <div className="flex-1">
              <span className="text-neutral-500 block">Telepon / WA</span>
              <span className="font-semibold text-neutral-900">{user.phone || '-'}</span>
            </div>
            <button 
              onClick={handleEditProfileClick} 
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-orange-600 rounded-full hover:bg-orange-50 transition-colors"
              title="Edit Profil"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Edit Modal */}
        {isEditingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold mb-6">Edit Profil</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Nama Lengkap</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Telepon / WA</label>
                  <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Password Baru (Biarkan kosong jika tetap)</label>
                  <input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
              
              <button 
                onClick={saveProfile}
                disabled={savingProfile}
                className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50"
              >
                {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </div>
          </div>
        )}

        {/* Order List */}
        <div className="lg:col-span-2 space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl text-center border border-neutral-200 shadow-sm">
              <Package className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">Anda belum memiliki pesanan.</p>
              <button 
                onClick={() => navigate('/menus')}
                className="mt-6 text-orange-600 font-medium hover:underline"
              >
                Mulai Memesan
              </button>
            </div>
          ) : (
            orders.map(order => (
              <motion.div 
                key={order.id}
                onClick={() => fetchOrderDetails(order.id)}
                className={`bg-white p-5 rounded-2xl border cursor-pointer transition-all shadow-sm ${activeOrder?.id === order.id ? 'border-orange-500 ring-2 ring-orange-100' : 'border-neutral-200 hover:border-orange-300'}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-lg">Pesanan #{order.id}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <Clock className="w-4 h-4" />
                      {new Date(order.created_at).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-500">Total Harga</p>
                    <p className="font-bold text-orange-600 text-lg">Rp {order.total_price.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Order Details Panel */}
        <div className="lg:col-span-1">
          {activeOrder ? (
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-4 pb-4 border-b border-neutral-100">Detail #{activeOrder.id}</h2>
              <div className="space-y-4 mb-6">
                {activeOrder.items?.map((item: any) => (
                  <div key={item.id} className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-sm leading-tight text-neutral-900">{item.name}</p>
                        <p className="text-xs text-neutral-500 mt-1">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="font-semibold text-sm">
                        Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                      </div>
                    </div>
                    {activeOrder.status === 'Selesai' && (
                      <div className="flex flex-col gap-2 bg-neutral-50 p-3 rounded-lg mt-2">
                        {reviewingMenuId === item.menu_id ? (
                          <div className="space-y-2">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star 
                                  key={star} 
                                  onClick={() => setRating(star)} 
                                  className={`w-5 h-5 cursor-pointer ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}`} 
                                />
                              ))}
                            </div>
                            <textarea 
                              value={comment}
                              onChange={e => setComment(e.target.value)}
                              placeholder="Tulis ulasan Anda..."
                              className="w-full p-2 border border-neutral-200 rounded-md text-sm"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => submitReview(item.menu_id)} className="bg-orange-600 text-white px-3 py-1 rounded text-xs font-semibold">Kirim Ulasan</button>
                              <button onClick={() => setReviewingMenuId(null)} className="text-neutral-500 px-3 py-1 rounded text-xs">Batal</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setReviewingMenuId(item.menu_id)} className="text-xs text-orange-600 font-semibold self-start hover:underline">
                            Beli Ulasan
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="bg-neutral-50 p-4 rounded-xl mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-500">Status</span>
                  <span className="font-semibold">{activeOrder.status}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="font-semibold">Rp {activeOrder.total_price.toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t border-neutral-200 mt-2 pt-2 mb-2 text-sm">
                  {activeOrder.event_date && (
                    <>
                      <span className="text-neutral-500 block mb-1">Tanggal Acara:</span>
                      <p className="font-medium text-neutral-800 break-words mb-2">{new Date(activeOrder.event_date).toLocaleString('id-ID')}</p>
                    </>
                  )}
                  <span className="text-neutral-500 block mb-1">Alamat Pengiriman:</span>
                  <p className="font-medium text-neutral-800 break-words">{activeOrder.address || '-'}</p>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-neutral-200 mt-2 mb-4">
                  <span>Total</span>
                  <span className="text-orange-600">Rp {activeOrder.total_price.toLocaleString('id-ID')}</span>
                </div>

                {activeOrder.status === 'Selesai' && (
                  <div className="border-t border-neutral-200 pt-4 mt-2">
                    <h3 className="font-bold text-md mb-3">Penilaian Pesanan</h3>
                    {activeOrder.rating ? (
                      <div>
                        <div className="flex gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} className={star <= activeOrder.rating ? 'text-yellow-400' : 'text-neutral-300'}>★</span>
                          ))}
                        </div>
                        <p className="text-sm text-neutral-600 italic">" {activeOrder.comment || 'Tidak ada komentar'} "</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex gap-1 text-2xl">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => setRating(star)} className={`focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-neutral-300'}`}>★</button>
                          ))}
                        </div>
                        <textarea
                          rows={2}
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          placeholder="Ceritakan pengalaman Anda..."
                          className="w-full p-2 border border-neutral-200 rounded-md text-sm"
                        />
                        <button onClick={() => submitOrderReview(activeOrder.id)} className="w-full bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition">
                          Kirim Penilaian
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            orders.length > 0 && (
              <div className="bg-neutral-50 p-8 rounded-2xl border border-neutral-200 text-center text-neutral-500 sticky top-24">
                Klik pesanan di daftar untuk melihat detail.
              </div>
            )
          )}
        </div>
      </div>
    </PageTransition>
  );
}
