import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
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
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/all-reviews')
      .then(r => r.json())
      .then(data => {
        const mapped = data.map((d: any) => ({
          id: d.id,
          rating: d.rating,
          content: d.comment,
          user_name: d.user_name
        }));
        setTestimonials(mapped.slice(0, 4));
      })
      .catch(console.error);

    fetch('/api/menus')
      .then(r => r.json())
      .then(setMenus)
      .catch(console.error);
  }, []);

  const filteredMenus = menus.filter(menu => {
    const matchSearch = (menu.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (menu.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="hero-container">
        <div className="hero-card">
          <p className="uppercase tracking-[0.2em] font-semibold text-xs mb-6 text-yellow-400 drop-shadow-md">Selamat Datang di Saji Katering</p>
          <h1 className="hero-title">Sajian <span className="highlight">Elegan</span></h1>
          <p className="hero-desc">
            Cita rasa autentik Nusantara dengan sentuhan modern. Kami menghadirkan pengalaman boga premium untuk setiap acara spesial Anda.
          </p>
          <button
            onClick={() => navigate('/menus')}
            className="hero-btn"
          >
            Lihat Menu Kami
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-6 bg-white rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <div className="relative">
              <div className="rounded-[8rem] overflow-hidden shadow-2xl aspect-[3/4] bg-neutral-200">
                <img 
                  src="https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=2070&auto=format&fit=crop" 
                  alt="Dapur Saji Katering" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="pl-0 lg:pl-12">
              <h2 className="font-serif text-4xl md:text-5xl text-[var(--color-earth-dark)] mb-8 font-medium">Dedikasi Pada Rasa & <span className="italic">Kualitas</span></h2>
              <p className="text-neutral-600 mb-6 leading-relaxed text-lg font-light">
                Berawal dari dapur keluarga pada tahun 2010. Kecintaan kami pada kuliner Indonesia yang kaya rempah membawa Saji Katering menjadi penyedia layanan boga terpercaya.
              </p>
              <p className="text-neutral-600 mb-6 leading-relaxed text-lg font-light">
                Setiap hidangan adalah sebuah dedikasi yang diracik khusus untuk menghangatkan setiap pertemuan. Dari jamuan intim hingga perayaan megah, kualitas rasa kami tetap konsisten.
              </p>
              <button 
                onClick={() => navigate('/menus')}
                className="mt-4 uppercase tracking-[0.1em] text-xs font-semibold text-orange-600 hover:text-orange-700 underline underline-offset-8 transition-colors"
                >
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>

          <div className="bg-[var(--color-warm-white)] rounded-[3rem] p-10 md:p-20 text-center card-shadow">
            <h2 className="font-serif text-3xl md:text-4xl text-[var(--color-earth-dark)] mb-16">Pilar Pelayanan Kami</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border border-neutral-300 flex items-center justify-center text-2xl mb-6 bg-white">🌱</div>
                <h3 className="font-serif text-2xl font-medium text-[var(--color-earth-dark)] mb-3">Bahan Pilihan</h3>
                <p className="text-neutral-600 font-light leading-relaxed">Komitmen pada kesegaran paripurna, dipasok dari produsen lokal terbaik setiap pagi.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border border-neutral-300 flex items-center justify-center text-2xl mb-6 bg-white">👨‍🍳</div>
                <h3 className="font-serif text-2xl font-medium text-[var(--color-earth-dark)] mb-3">Maha Karya</h3>
                <p className="text-neutral-600 font-light leading-relaxed">Diramu oleh koki profesional yang tak kenal kompromi dalam menjaga keaslian rasa.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border border-neutral-300 flex items-center justify-center text-2xl mb-6 bg-white">✨</div>
                <h3 className="font-serif text-2xl font-medium text-[var(--color-earth-dark)] mb-3">Estetika Saji</h3>
                <p className="text-neutral-600 font-light leading-relaxed">Tak hanya nikmat di lidah, seluruh hidangan kami disempurnakan dengan tatanan yang memanjakan mata.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menus Showcase Section */}
      <section className="py-24 px-6 bg-[var(--color-warm-white)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-[var(--color-earth-dark)] mb-4">Eksplorasi Menu Kami</h2>
            <p className="text-neutral-600 font-light max-w-2xl mx-auto">Sajian hangat dan nikmat untuk menyempurnakan hari istimewa Anda.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMenus.slice(0, 4).map((menu, i) => (
              <motion.div 
                key={menu.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer hover:-translate-y-1"
                onClick={() => navigate(`/menus?search=${encodeURIComponent(menu.name)}`)}
              >
                <div className="h-40 bg-neutral-200 relative">
                  {menu.image_url ? (
                    <img src={menu.image_url} alt={menu.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">No Image</div>
                  )}
                  <span className="absolute top-3 left-3 bg-white/90 px-3 py-1 text-[10px] font-semibold rounded-full text-orange-700">
                    {menu.category}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-md font-bold text-neutral-900 line-clamp-1 mb-1">{menu.name}</h3>
                  {menu.review_count > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold text-neutral-700">{Number(menu.avg_rating).toFixed(1)}</span>
                    </div>
                  )}
                  <p className="text-xs text-neutral-500 mt-1 flex-grow line-clamp-2">{menu.description}</p>
                  <div className="mt-4 pt-3 border-t border-neutral-50">
                    <span className="text-sm font-bold text-orange-600">Rp {menu.price.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
             <button onClick={() => navigate('/menus')} className="text-sm font-semibold text-orange-600 hover:text-orange-700 underline underline-offset-4 uppercase tracking-wider">
                Lihat Semua Menu
             </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-[var(--color-earth-dark)] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="font-serif text-4xl mb-6 font-light">Cerita Harmoni Rasa</h2>
            <button
              onClick={() => navigate('/reviews')}
              className="mt-4 uppercase tracking-[0.1em] text-xs font-semibold text-orange-400 hover:text-orange-500 underline underline-offset-8 transition-colors"
            >
              Ulasan Selengkapnya
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.length === 0 ? (
              <p className="text-neutral-400 col-span-2 text-center pb-8 font-light">Belum ada penilaian yang tersimpan.</p>
            ) : (
              testimonials.map((testi, i) => (
                <motion.div 
                  key={testi.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#38382e] p-10 rounded-[2rem] flex flex-col h-full"
                >
                  <div className="flex gap-1 mb-6 text-orange-400">
                    {Array.from({ length: testi.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="font-serif text-xl italic mb-8 leading-relaxed font-light text-neutral-200 flex-grow">"{testi.content || 'Pengalaman yang sungguh tak terlupakan.'}"</p>
                  <p className="tracking-wide text-xs uppercase font-semibold text-[#a8a892]">— {testi.user_name || 'Tamu Kehormatan'}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}

