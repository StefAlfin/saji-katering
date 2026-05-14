import React from 'react';
import { motion } from 'motion/react';

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 lg:py-24">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-6">Tentang Saji Katering</h1>
          <p className="text-lg md:text-xl text-neutral-600 leading-relaxed">
            Menyajikan hidangan berkualitas dengan cita rasa Nusantara untuk setiap momen berharga Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <div className="rounded-3xl overflow-hidden shadow-xl aspect-video md:aspect-square bg-neutral-200">
            <img 
              src="https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=2070&auto=format&fit=crop" 
              alt="Dapur Saji Katering" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">Cerita Kami</h2>
            <p className="text-neutral-600 mb-4 leading-relaxed">
              Saji Katering berawal dari dapur keluarga pada tahun 2010. Berawal dari pesanan kecil untuk tetangga dan kerabat, kecintaan kami pada masakan Indonesia membawa Saji Katering berkembang menjadi salah satu penyedia layanan katering terpercaya di kota ini.
            </p>
            <p className="text-neutral-600 mb-4 leading-relaxed">
              Kami percaya bahwa setiap hidangan adalah sebuah karya seni yang dapat membawa kehangatan di setiap acara. Dari pernikahan skala besar hingga rapat kantor bulanan, kami berkomitmen untuk memberikan kualitas terbaik.
            </p>
            <p className="text-neutral-600 leading-relaxed">
              Semua bahan baku kami pilih dengan teliti dan segar setiap hari, dimasak oleh tenaga ahli berpengalaman yang menjaga kebersihan dan standar higienis dengan ketat.
            </p>
          </div>
        </div>

        <div className="bg-orange-50 rounded-3xl p-8 md:p-16 mb-24 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-12">Komitmen Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Bahan Segar</h3>
              <p className="text-neutral-600 text-sm">Sayuran dan daging segar setiap hari dari pemasok lokal terpercaya.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Kualitas Premium</h3>
              <p className="text-neutral-600 text-sm">Standar rasa yang konsisten dan lezat, dimasak oleh koki profesional.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Pelayanan Terbaik</h3>
              <p className="text-neutral-600 text-sm">Pengantaran tepat waktu dengan kemasan yang rapi dan higienis.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
