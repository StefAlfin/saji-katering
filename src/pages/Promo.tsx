import React from 'react';
import { motion } from 'motion/react';

export default function Promo() {
  const promos = [
    {
      id: 1,
      title: "Diskon 20% Pengguna Baru",
      description: "Dapatkan potongan 20% untuk pesanan pertama Anda minimal Rp 500.000.",
      code: "SAJIBARU20",
      validUntil: "31 Desember 2024",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Gratis Ongkir se-Kota",
      description: "Nikmati gratis ongkos kirim untuk pesanan harian (Nasi Kotak/Bento) minimal 50 pax.",
      code: "FREEONGKIR50",
      validUntil: "Berlaku setiap hari",
      image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?q=80&w=2071&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Paket Pernikahan Hemat",
      description: "Cashback hingga Rp 2.000.000 untuk pemesanan paket pernikahan Platinum sebelum bulan depan.",
      code: "NIKAHHEMAT",
      validUntil: "Akhir Bulan Ini",
      image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mb-4">Promo Spesial Saji</h1>
          <p className="text-neutral-500 max-w-2xl mx-auto">
            Gunakan kode promo di bawah ini saat melakukan pemesanan melalui WhatsApp atau aplikasi untuk mendapatkan penawaran terbaik dari kami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promos.map(promo => (
            <div key={promo.id} className="bg-white rounded-3xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-md transition group flex flex-col">
              <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden">
                <img 
                  src={promo.image} 
                  alt={promo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">{promo.title}</h3>
                <p className="text-sm text-neutral-500 mb-6 flex-1">{promo.description}</p>
                
                <div className="mt-auto">
                  <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center justify-between mb-4">
                    <span className="font-mono font-bold text-orange-600 truncate mr-4">{promo.code}</span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(promo.code)}
                      className="text-xs bg-white border border-orange-200 text-orange-600 px-3 py-1.5 rounded-lg font-medium hover:bg-orange-600 hover:text-white transition"
                    >
                      Salin
                    </button>
                  </div>
                  <div className="text-xs text-neutral-400">
                    Berlaku s/d: <span className="font-medium text-neutral-600">{promo.validUntil}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
