import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import React from 'react';
import { AnimatePresence } from 'motion/react';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Cart from './pages/Cart';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Promo from './pages/Promo';
import Navbar from './components/Navbar';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<Home key="home" />} />
        <Route path="/login" element={<Login key="login" />} />
        <Route path="/cart" element={<Cart key="cart" />} />
        <Route path="/dashboard" element={<UserDashboard key="userDash" />} />
        <Route path="/admin" element={<AdminDashboard key="adminDash" />} />
        <Route path="/about" element={<About key="about" />} />
        <Route path="/promo" element={<Promo key="promo" />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
          <Navbar />
          <main className="pt-16 min-h-[calc(100vh-64px)] flex flex-col">
            <AnimatedRoutes />
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

