import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="flex-grow flex items-center justify-center p-4 bg-orange-50/50"
    >
      {children}
    </motion.div>
  );
}

export default function Login() {
  const location = useLocation();
  const [isRegistering, setIsRegistering] = useState(location.state?.isRegistering || false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        // Register API flow
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, username, email, password, phone })
        });
        
        const regData = await regRes.json();
        
        if (!regRes.ok) {
          throw new Error(regData.error || 'Gagal mendaftar');
        }
      }

      // Login API flow
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Gagal masuk');
      }

      login({ user: data.user, token: data.token });
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900">
              {isRegistering ? 'Buat Akun Baru' : 'Selamat Datang Kembali'}
            </h1>
            <p className="text-neutral-500 mt-2">
              {isRegistering ? 'Daftar untuk mulai memesan katering.' : 'Masuk ke akun SajiKatering Anda.'}
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {isRegistering && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-medium text-neutral-700 mb-1 mt-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required={isRegistering}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition mb-4"
                    placeholder="Nama Anda"
                  />
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                  <input
                    type="email"
                    required={isRegistering}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition"
                    placeholder="email@contoh.com"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition"
                placeholder="username"
              />
            </div>

            <AnimatePresence>
              {isRegistering && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-medium text-neutral-700 mb-1 mt-4">Nomor Telepon / WA</label>
                  <input
                    type="tel"
                    required={isRegistering}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition"
                    placeholder="081234567890"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white font-semibold py-3 rounded-xl hover:bg-orange-700 transition disabled:opacity-70"
            >
              {loading ? 'Memproses...' : (isRegistering ? 'Daftar Sekarang' : 'Masuk')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            {isRegistering ? 'Sudah punya akun? ' : 'Belum punya akun? '}
            <button 
              type="button"
              onClick={() => {
                 setIsRegistering(!isRegistering);
                 setError('');
              }} 
              className="text-orange-600 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              {isRegistering ? 'Masuk di sini' : 'Daftar sekarang'}
            </button>
          </p>

          {!isRegistering && (
            <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-center text-gray-400">
              <p><strong>Demo Admin:</strong> username: <code>admin</code>, password: <code>admin123</code></p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
