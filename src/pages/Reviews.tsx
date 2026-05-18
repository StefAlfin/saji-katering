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
      className="flex flex-col flex-grow bg-neutral-50"
    >
      {children}
    </motion.div>
  );
}

export default function Reviews() {
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/all-reviews')
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const mapped = data.map((d: any) => ({
          id: d.id,
          rating: d.rating,
          content: d.comment,
          user_name: d.user_name
        }));
        setTestimonials(mapped);
      })
      .catch(console.error);
  }, []);

  return (
    <PageTransition>
      <section className="py-20 px-4 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">Penilaian Pelanggan</h1>
            <p className="text-neutral-500 max-w-2xl mx-auto">
              Terima kasih atas segala kepercayaan dan pengalaman yang telah dibagikan oleh pelanggan setia Saji Katering.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.length === 0 ? (
              <div className="col-span-full py-20 bg-neutral-50 rounded-2xl border border-neutral-100 text-center">
                <p className="text-neutral-500">Belum ada penilaian dari pelanggan.</p>
              </div>
            ) : (
              testimonials.map((testi, i) => (
                <motion.div 
                  key={testi.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-neutral-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-1 mb-6 text-yellow-500">
                    {Array.from({ length: testi.rating }).map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-neutral-700 italic mb-6 leading-relaxed">"{testi.content || 'Tidak ada komentar'}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                      {(testi.user_name || 'P')[0].toUpperCase()}
                    </div>
                    <p className="font-semibold text-neutral-900">{testi.user_name || 'Pelanggan'}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
