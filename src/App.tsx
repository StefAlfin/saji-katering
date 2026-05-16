import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Cart from './pages/Cart';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Menus from './pages/Menus';
import Promo from './pages/Promo';
import Reviews from './pages/Reviews';
import Contact from './pages/Contact';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location}>
          <Route path="/" element={<Home key="home" />} />
          <Route path="/menus" element={<Menus key="menus" />} />
          <Route path="/login" element={<Login key="login" />} />
          <Route path="/cart" element={<Cart key="cart" />} />
          <Route path="/dashboard" element={<UserDashboard key="userDash" />} />
          <Route path="/admin" element={<AdminDashboard key="adminDash" />} />
          <Route path="/promo" element={<Promo key="promo" />} />
          <Route path="/reviews" element={<Reviews key="reviews" />} />
          <Route path="/contact" element={<Contact key="contact" />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-neutral-50 font-sans text-neutral-900">
          <Navbar />
          <main className="pt-16 min-h-[calc(100vh-64px)] flex flex-col flex-grow">
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

