import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      {children}
    </motion.div>
  );
}

export default function Contact() {
  const [contactInfo, setContactInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch('/api/contact-info')
      .then(r => r.json())
      .then(data => {
        setContactInfo(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    try {
      const res = await fetch('/api/contact-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, message })
      });
      if (res.ok) {
        setSuccessMsg('Terima kasih! Pesan Anda telah terkirim.');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        alert('Gagal mengirim pesan.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 text-neutral-800">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-6 text-neutral-900">Hubungi Kami</h1>
        <p className="text-center text-lg text-neutral-600 mb-16 max-w-2xl mx-auto">
          {contactInfo.description || 'Kami siap melayani kebutuhan acara Anda dengan hidangan terbaik.'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Info Section */}
          <div className="space-y-8">
            <h2 className="text-2xl font-serif font-bold mb-8">Informasi Kontak</h2>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Alamat</h3>
                <p className="text-neutral-600 leading-relaxed">{contactInfo.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Telepon / WhatsApp</h3>
                <p className="text-neutral-600 leading-relaxed">{contactInfo.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Email</h3>
                <p className="text-neutral-600 leading-relaxed">{contactInfo.email}</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
            <h2 className="text-2xl font-serif font-bold mb-6">Kirim Pesan</h2>
            {successMsg ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6">
                {successMsg}
              </div>
            ) : null}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Alamat Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Pesan / Pertanyaan</label>
                <textarea 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-bold transition disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                {submitting ? 'Mengirim...' : 'Kirim Pesan'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
