import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/sounds', label: 'Sounds' },
  { to: '/volunteer', label: 'Volunteer' },
  { to: '/contact', label: 'Contact' },
];

// 4-color logo mark representing the brand colors
function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-xl overflow-hidden shrink-0 grid grid-cols-2 gap-0"
      style={{ width: size, height: size }}
    >
      <div style={{ backgroundColor: '#2563EB' }} />
      <div style={{ backgroundColor: '#EF4444' }} />
      <div style={{ backgroundColor: '#FACC15' }} />
      <div style={{ backgroundColor: '#22C55E' }} />
    </div>
  );
}

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { count } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0"
          style={{ fontFamily: 'Fredoka, sans-serif' }}
        >
          <LogoMark size={32} />
          <span className="text-gray-900" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            minashow
          </span>
        </Link>

        {/* Desktop Nav Pills */}
        <nav className="hidden md:flex items-center bg-gray-100 rounded-full px-1.5 py-1.5 gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                isActive(link.to)
                  ? 'bg-white shadow-sm text-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 font-medium'
              }`}
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {count}
              </span>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Admin
                </Link>
              )}
              <Link
                to="/dashboard"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {user.name.split(' ')[0]}
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-full border border-gray-300 hover:border-gray-400 transition-colors"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Sign in
              </Link>
              <Link
                to="/login?tab=register"
                className="text-sm font-semibold text-white px-3 py-1.5 rounded-full transition-colors"
                style={{ fontFamily: 'Nunito, sans-serif', backgroundColor: '#2563EB' }}
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${
                isActive(link.to)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-2 mt-1 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  My Orders
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 text-left"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Sign in
                </Link>
                <Link
                  to="/login?tab=register"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-center text-white hover:opacity-90"
                  style={{ fontFamily: 'Nunito, sans-serif', backgroundColor: '#2563EB' }}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
