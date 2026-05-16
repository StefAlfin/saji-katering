import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Utensils, LayoutDashboard, Settings, Tags, Edit, Trash, MessageSquare, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto w-full p-4 py-8"
    >
      {children}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [contactInfo, setContactInfo] = useState({ address: '', phone: '', email: '', description: '' });
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [newMenu, setNewMenu] = useState({ name: '', description: '', price: '', category: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
  
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editCatName, setEditCatName] = useState('');

  const [savingContact, setSavingContact] = useState(false);

  const fetchData = async () => {
    try {
      const [oRes, uRes, mRes, cRes, cmRes, ciRes] = await Promise.all([
        fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/menus'),
        fetch('/api/categories'),
        fetch('/api/contact-messages', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/contact-info')
      ]);

      setOrders(await oRes.json());
      setUsers(await uRes.json());
      setMenus(await mRes.json());
      setCategories(await cRes.json());
      setContactMessages(await cmRes.json());
      const ci = await ciRes.json();
      setContactInfo({ 
        address: ci.address || '', 
        phone: ci.phone || '', 
        email: ci.email || '', 
        description: ci.description || '' 
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate, token]);

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const saveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', newMenu.name);
      formData.append('description', newMenu.description);
      formData.append('price', newMenu.price);
      formData.append('category', newMenu.category);
      if (imageFile) {
        formData.append('image', imageFile);
      } else {
        formData.append('image_url', imageUrl);
      }

      let res;
      if (editingMenuId) {
        res = await fetch(`/api/menus/${editingMenuId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
      } else {
        res = await fetch('/api/menus', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
      }

      if (!res.ok) {
        const errData = await res.text();
        throw new Error(`Error saving menu: ${errData}`);
      }

      setNewMenu({ name: '', description: '', price: '', category: '' });
      setImageFile(null);
      setImageUrl('');
      setEditingMenuId(null);
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Terjadi kesalahan saat menyimpan menu');
    }
  };

  const handleEditClick = (menu: any) => {
    setEditingMenuId(menu.id);
    setNewMenu({
      name: menu.name || '',
      description: menu.description || '',
      price: menu.price ? menu.price.toString() : '0',
      category: menu.category || ''
    });
    setImageFile(null);
    setImageUrl(menu.image_url || '');
  };

  const cancelEdit = () => {
    setEditingMenuId(null);
    setNewMenu({ name: '', description: '', price: '', category: '' });
    setImageFile(null);
    setImageUrl('');
  };

  const deleteMenu = async (id: number) => {
    if (!window.confirm('Yakin hapus menu ini?')) return;
    try {
      await fetch(`/api/menus/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id: number) => {
    if (!window.confirm('Yakin hapus pelanggan ini beserta semua data terkaitnya?')) return;
    try {
      await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCatName })
      });
      if (res.ok) {
        setNewCatName('');
        fetchData();
      } else {
        alert('Gagal menambah kategori');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatId) return;
    try {
      const res = await fetch(`/api/categories/${editingCatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editCatName })
      });
      if (res.ok) {
        setEditingCatId(null);
        setEditCatName('');
        fetchData();
      } else {
        alert('Gagal mengubah kategori');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Hapus kategori ini?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Gagal menghapus kategori');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveContactInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContact(true);
    try {
      const res = await fetch('/api/contact-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(contactInfo)
      });
      if (res.ok) {
        alert('Info kontak berhasil disimpan');
      } else {
        alert('Gagal menyimpan info kontak');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingContact(false);
    }
  };

  const markMessageAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/contact-messages/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center flex-grow">Loading Admin Panel...</div>;

  return (
    <PageTransition>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-col gap-2">
            <h2 className="text-xl font-bold mb-4 px-2">Admin Panel</h2>
            {[
              { id: 'orders', label: 'Kelola Pesanan', icon: <LayoutDashboard className="w-5 h-5"/> },
              { id: 'menus', label: 'Kelola Menu', icon: <Utensils className="w-5 h-5"/> },
              { id: 'categories', label: 'Kelola Kategori', icon: <Tags className="w-5 h-5"/> },
              { id: 'users', label: 'Data Pelanggan', icon: <Users className="w-5 h-5"/> },
              { id: 'contact_info', label: 'Info Kontak', icon: <MapPin className="w-5 h-5"/> },
              { id: 'messages', label: 'Pesan Masuk', icon: <MessageSquare className="w-5 h-5"/> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left font-medium ${
                  activeTab === tab.id ? 'bg-orange-100 text-orange-700' : 'hover:bg-neutral-100 text-neutral-600'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm min-h-[500px]">
            {activeTab === 'orders' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-2xl font-bold mb-6">Daftar Pesanan</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-neutral-200 text-neutral-500">
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Pelanggan</th>
                        <th className="py-3 px-4">Alamat</th>
                        <th className="py-3 px-4">Tanggal Order</th>
                        <th className="py-3 px-4">Tanggal Acara</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Penilaian</th>
                        <th className="py-3 px-4">Status & Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr><td colSpan={8} className="text-center p-6 text-neutral-500">Belum ada pesanan.</td></tr>
                      ) : (
                        orders.map(order => (
                          <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                            <td className="py-3 px-4 font-medium">#{order.id}</td>
                            <td className="py-3 px-4">{order.user_name}</td>
                            <td className="py-3 px-4 text-sm text-neutral-600 max-w-[200px] truncate" title={order.address}>{order.address || '-'}</td>
                            <td className="py-3 px-4 text-sm text-neutral-500">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                            <td className="py-3 px-4 text-sm font-semibold text-neutral-800">{order.event_date ? new Date(order.event_date).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}</td>
                            <td className="py-3 px-4 text-orange-600 font-semibold">Rp {order.total_price.toLocaleString()}</td>
                            <td className="py-3 px-4">
                              {order.rating ? (
                                <div className="text-sm">
                                  <div className="text-yellow-500 font-bold">★ {order.rating}</div>
                                  <div className="text-neutral-500 italic truncate max-w-[150px]" title={order.comment}>
                                    "{order.comment}"
                                  </div>
                                </div>
                              ) : '-'}
                            </td>
                            <td className="py-3 px-4">
                              <select 
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className="bg-white border text-sm border-neutral-300 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                              >
                                <option value="Menunggu">Menunggu</option>
                                <option value="Diproses">Diproses</option>
                                <option value="Dikirim">Dikirim</option>
                                <option value="Selesai">Selesai</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'menus' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-2xl font-bold mb-6">Kelola Menu Katering</h3>
                
                {/* Add Menu Form */}
                <div className="mb-8 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                  <h4 className="font-bold text-lg mb-4">{editingMenuId ? 'Edit Menu' : 'Tambah Menu Baru'}</h4>
                  <form onSubmit={saveMenu} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Nama Menu" required className="p-2 border rounded-xl"
                      value={newMenu.name} onChange={e => setNewMenu({...newMenu, name: e.target.value})} />
                    <input type="number" placeholder="Harga (Rp)" required className="p-2 border rounded-xl"
                      value={newMenu.price} onChange={e => setNewMenu({...newMenu, price: e.target.value})} />
                    <select
                      className="p-2 border rounded-xl bg-white"
                      value={newMenu.category}
                      onChange={e => setNewMenu({...newMenu, category: e.target.value})}
                      required
                    >
                      <option value="" disabled>Pilih Kategori</option>
                      {categories.map((c: any) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-neutral-700">Upload Gambar Menu</label>
                      <input type="file" accept="image/*" className="p-2 border rounded-xl bg-white file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                        onChange={e => {
                          setImageFile(e.target.files ? e.target.files[0] : null);
                          if (e.target.files && e.target.files.length > 0) setImageUrl('');
                        }} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-neutral-700">Atau Gunakan Link URL</label>
                      <input type="text" placeholder="https://..." className="p-2 border rounded-xl"
                        value={imageUrl} onChange={e => {
                          setImageUrl(e.target.value);
                          if (e.target.value) setImageFile(null);
                        }} />
                    </div>
                    
                    {/* Image Preview */}
                    {(imageUrl || imageFile) && (
                      <div className="md:col-span-2 mt-2">
                        <p className="text-sm text-neutral-500 mb-2">Preview Gambar:</p>
                        <img 
                          src={imageFile ? URL.createObjectURL(imageFile) : imageUrl} 
                          alt="Preview" 
                          className="w-32 h-32 object-cover rounded-xl border border-neutral-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+Image';
                          }}
                        />
                      </div>
                    )}

                    <textarea placeholder="Deskripsi Singkat" className="p-2 border rounded-xl md:col-span-2"
                      value={newMenu.description} onChange={e => setNewMenu({...newMenu, description: e.target.value})} />
                    <div className="flex gap-4 md:col-span-2">
                       <button type="submit" className="flex-1 bg-orange-600 text-white font-semibold py-2 px-6 rounded-xl hover:bg-orange-700">
                         {editingMenuId ? 'Update Menu' : 'Simpan Menu'}
                       </button>
                       {editingMenuId && (
                         <button type="button" onClick={cancelEdit} className="bg-neutral-200 text-neutral-800 font-semibold py-2 px-6 rounded-xl hover:bg-neutral-300">
                           Batal
                         </button>
                       )}
                    </div>
                  </form>
                </div>

                {/* Menu List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {menus.map(menu => (
                    <div key={menu.id} className="border border-neutral-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <img src={menu.image_url || 'https://via.placeholder.com/60'} alt={menu.name} className="w-16 h-16 object-cover rounded-lg" />
                        <div>
                          <p className="font-bold">{menu.name}</p>
                          <p className="text-orange-600 text-sm">Rp {menu.price.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => handleEditClick(menu)} className="text-blue-500 hover:text-blue-700 text-sm font-medium text-right">Edit</button>
                        <button onClick={() => deleteMenu(menu.id)} className="text-red-500 hover:text-red-700 text-sm font-medium text-right">Hapus</button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'categories' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-2xl font-bold mb-6">Kelola Kategori Menu</h3>
                
                <div className="mb-8 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                  <h4 className="font-bold text-lg mb-4">Tambah Kategori Baru</h4>
                  <form onSubmit={handleCreateCategory} className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="Nama Kategori (cth: Paket Hemat)" 
                      required 
                      className="flex-1 p-2 border rounded-xl"
                      value={newCatName} 
                      onChange={e => setNewCatName(e.target.value)} 
                    />
                    <button type="submit" className="bg-orange-600 text-white font-semibold py-2 px-6 rounded-xl hover:bg-orange-700 whitespace-nowrap">
                      Tambah
                    </button>
                  </form>
                </div>

                <div className="bg-white border text-left border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-neutral-50">
                      <tr className="border-b border-neutral-200">
                        <th className="py-3 px-4 font-semibold text-neutral-600">ID</th>
                        <th className="py-3 px-4 font-semibold text-neutral-600 w-full">Nama Kategori</th>
                        <th className="py-3 px-4 font-semibold text-neutral-600 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length === 0 ? (
                        <tr><td colSpan={3} className="text-center p-6 text-neutral-500">Belum ada kategori.</td></tr>
                      ) : (
                        categories.map(cat => (
                          <tr key={cat.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                            <td className="py-3 px-4 font-medium text-neutral-500">#{cat.id}</td>
                            <td className="py-3 px-4">
                              {editingCatId === cat.id ? (
                                <form onSubmit={handleUpdateCategory} className="flex gap-2 w-full max-w-sm">
                                  <input 
                                    type="text" 
                                    value={editCatName} 
                                    onChange={e => setEditCatName(e.target.value)} 
                                    className="p-1.5 border rounded-lg flex-1"
                                    required 
                                    autoFocus
                                  />
                                  <button type="submit" className="text-sm bg-orange-600 text-white px-3 py-1.5 rounded-lg flex gap-1 items-center hover:bg-orange-700">
                                    Simpan
                                  </button>
                                  <button type="button" onClick={() => setEditingCatId(null)} className="text-sm bg-neutral-200 text-neutral-700 px-3 py-1.5 rounded-lg hover:bg-neutral-300">
                                    Batal
                                  </button>
                                </form>
                              ) : (
                                <span className="font-medium text-neutral-800">{cat.name}</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {editingCatId !== cat.id && (
                                <div className="flex justify-center gap-3">
                                  <button 
                                    onClick={() => { setEditingCatId(cat.id); setEditCatName(cat.name); }}
                                    className="text-blue-500 hover:text-blue-700 transition-colors"
                                    title="Edit Kategori"
                                  >
                                    <Edit className="w-5 h-5"/>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                    title="Hapus Kategori"
                                  >
                                    <Trash className="w-5 h-5"/>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-2xl font-bold mb-6">Data Pelanggan</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-neutral-200 text-neutral-500">
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Nama</th>
                        <th className="py-3 px-4">Username</th>
                        <th className="py-3 px-4">Telepon / WA</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr><td colSpan={6} className="text-center p-6 text-neutral-500">Belum ada pelanggan.</td></tr>
                      ) : (
                        users.map(u => (
                          <tr key={u.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                            <td className="py-3 px-4 font-medium text-neutral-500">#{u.id}</td>
                            <td className="py-3 px-4 font-semibold">{u.name}</td>
                            <td className="py-3 px-4">{u.username}</td>
                            <td className="py-3 px-4">{u.phone || '-'}</td>
                            <td className="py-3 px-4">{u.email}</td>
                            <td className="py-3 px-4">
                              <button 
                                onClick={() => deleteUser(u.id)}
                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'contact_info' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-2xl font-bold mb-6">Edit Info Kontak</h3>
                <form onSubmit={handleSaveContactInfo} className="max-w-2xl space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Alamat</label>
                    <textarea 
                      value={contactInfo.address}
                      onChange={e => setContactInfo({...contactInfo, address: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Telepon / WhatsApp</label>
                    <input 
                      type="text" 
                      value={contactInfo.phone}
                      onChange={e => setContactInfo({...contactInfo, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      value={contactInfo.email}
                      onChange={e => setContactInfo({...contactInfo, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Deskripsi Pendek</label>
                    <textarea 
                      value={contactInfo.description}
                      onChange={e => setContactInfo({...contactInfo, description: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={3}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={savingContact}
                    className="bg-orange-600 text-white px-8 py-3 rounded-xl hover:bg-orange-700 transition font-bold disabled:opacity-50"
                  >
                    {savingContact ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'messages' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-2xl font-bold mb-6">Pesan Masuk (Form Kontak)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-neutral-200 text-neutral-500">
                        <th className="py-3 px-4 w-1/4">Dari</th>
                        <th className="py-3 px-4 w-1/4">Tanggal</th>
                        <th className="py-3 px-4 w-1/2">Pesan</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactMessages.length === 0 ? (
                        <tr><td colSpan={4} className="text-center p-6 text-neutral-500">Belum ada pesan.</td></tr>
                      ) : (
                        contactMessages.map((msg: any) => (
                          <tr key={msg.id} className={`border-b border-neutral-100 ${msg.is_read ? 'bg-white' : 'bg-orange-50 font-medium'}`}>
                            <td className="py-4 px-4">
                              <div className="font-semibold text-neutral-900">{msg.name}</div>
                              <div className="text-sm text-neutral-500">{msg.email}</div>
                            </td>
                            <td className="py-4 px-4 text-sm text-neutral-500 whitespace-nowrap">
                              {new Date(msg.created_at).toLocaleString('id-ID')}
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-neutral-700 whitespace-pre-wrap">{msg.message}</p>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              {!msg.is_read ? (
                                <button 
                                  onClick={() => markMessageAsRead(msg.id)}
                                  className="text-orange-600 hover:text-orange-800 text-sm font-semibold transition"
                                >
                                  Tandai Dibaca
                                </button>
                              ) : (
                                <span className="text-green-600 text-sm flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Dibaca
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </PageTransition>
  );
}
