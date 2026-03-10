import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "~/components/providers/cart-provider";
import { useAuth } from "~/components/providers/auth-provider";
import { LogoMark } from "./logo-mark";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/sounds", label: "Sounds" },
  { to: "/volunteer", label: "Volunteer" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { count } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0"
          style={{ fontFamily: "Fredoka, sans-serif" }}
        >
          <LogoMark size={80} />
        </Link>

        {/* Desktop pill nav */}
        <nav className="hidden lg:flex items-center bg-gray-100 rounded-full px-1.5 py-1.5 gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-1.5 rounded-full text-sm transition-all font-sans ${isActive(link.to)
                ? "bg-white shadow-sm text-brand-blue font-semibold"
                : "text-gray-600 hover:text-gray-900 font-medium"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: cart + auth */}
        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={`Cart (${count} items)`}
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden lg:flex items-center gap-3">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80 font-sans"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/dashboard"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 font-sans"
              >
                {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-sm font-semibold text-gray-500 hover:text-gray-700 font-sans"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-full border border-gray-300 hover:border-gray-400 transition-colors font-sans"
              >
                Sign in
              </Link>
              <Link
                to="/login?tab=register"
                className="text-sm font-semibold text-white px-3 py-1.5 rounded-full transition-colors font-sans"
                style={{ backgroundColor: "#202973" }}
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-full hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold font-sans ${isActive(link.to)
                ? "bg-secondary text-brand-blue"
                : "text-gray-700 hover:bg-gray-50"
                }`}
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
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 font-sans"
                >
                  My Orders
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-brand-blue hover:bg-secondary font-sans"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                    navigate("/");
                  }}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 text-left font-sans"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 font-sans"
                >
                  Sign in
                </Link>
                <Link
                  to="/login?tab=register"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-center text-white hover:opacity-90 font-sans"
                  style={{ backgroundColor: "#202973" }}
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
