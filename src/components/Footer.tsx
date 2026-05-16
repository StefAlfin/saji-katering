import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [contactInfo, setContactInfo] = useState({ address: 'Jl. Kuliner Nusantara No. 123, Jakarta Selatan, 12345', phone: '+62 812 3456 7890', email: 'halo@sajikatering.com' });

  useEffect(() => {
    fetch('/api/contact-info')
      .then(res => res.json())
      .then(data => {
        if (data && data.address) {
          setContactInfo(data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <footer className="bg-black text-neutral-400 pt-16 pb-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Brand Section */}
        <div className="flex flex-col items-start">
          <Link to="/" className="text-3xl font-serif font-bold tracking-tight text-white mb-4">
            <span>Saji Katering</span>
          </Link>
          <p className="text-sm font-light leading-relaxed mb-6 max-w-sm">
            Menghadirkan cita rasa autentik Nusantara dengan sentuhan elegan untuk setiap momen spesial Anda.
          </p>
          <div className="flex gap-4">
             <a href="#" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-[var(--color-olive)] hover:text-white transition-colors">
               <Instagram className="w-4 h-4" />
             </a>
             <a href="#" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-[var(--color-olive)] hover:text-white transition-colors">
               <Facebook className="w-4 h-4" />
             </a>
             <a href="#" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-[var(--color-olive)] hover:text-white transition-colors">
               <Twitter className="w-4 h-4" />
             </a>
          </div>
        </div>
        
        {/* Quick Links */}
        <div>
          <h3 className="text-white font-serif text-xl mb-6">Tautan Cepat</h3>
          <ul className="flex flex-col gap-4 text-sm font-light">
            <li><Link to="/" className="hover:text-white transition-colors">Beranda</Link></li>
            <li><Link to="/menus" className="hover:text-white transition-colors">Eksplorasi Menu</Link></li>
            <li><Link to="/promo" className="hover:text-white transition-colors">Promo Spesial</Link></li>
            <li><Link to="/reviews" className="hover:text-white transition-colors">Ulasan Pelanggan</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Kontak & Pertanyaan</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-white font-serif text-xl mb-6">Layanan Kami</h3>
          <ul className="flex flex-col gap-4 text-sm font-light">
            <li><span className="hover:text-white transition-colors cursor-pointer">Pernikahan</span></li>
            <li><span className="hover:text-white transition-colors cursor-pointer">Acara Perusahaan</span></li>
            <li><span className="hover:text-white transition-colors cursor-pointer">Ulang Tahun</span></li>
            <li><span className="hover:text-white transition-colors cursor-pointer">Nasi Kotak Premium</span></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white font-serif text-xl mb-6">Hubungi Kami</h3>
          <ul className="flex flex-col gap-4 text-sm font-light">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
              <span>{contactInfo.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-neutral-500 shrink-0" />
              <span>{contactInfo.phone}</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-neutral-500 shrink-0" />
              <span>{contactInfo.email}</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-light tracking-wide text-neutral-500">
        <p>&copy; {currentYear} Saji Katering. Hak Cipta Dilindungi Undang-Undang.</p>
        <div className="flex gap-4">
          <Link to="#" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
          <Link to="#" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
        </div>
      </div>
    </footer>
  );
}
