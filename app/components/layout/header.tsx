import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ShoppingCart, Menu, X, ChevronDown, User, Package, ShieldCheck, LogOut } from "lucide-react";
import { useCart } from "~/components/providers/cart-provider";
import { useAuth } from "~/components/providers/auth-provider";
import { LogoMark } from "./logo-mark";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { count } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (to: string) => {
    const path = location.pathname;
    if (to === "/") return path === "/";
    // "Shop" covers the catalog browse + any product/package detail page
    if (to === "/shop") {
      return (
        path.startsWith("/shop") ||
        path.startsWith("/product") ||
        path.startsWith("/package")
      );
    }
    return path.startsWith(to);
  };

  /** Close user dropdown when clicking outside */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0 font-display"
        >
          <LogoMark size={90} />
        </Link>

        {/* Desktop pill nav */}
        <nav className="hidden md:flex items-center bg-gray-100 rounded-full px-1.5 py-1.5 gap-0.5">
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
          {!isAdmin && (
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
          )}

          {user ? (
            /* User dropdown */
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors font-sans"
              >
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-1.5 overflow-hidden">
                  {/* User info header */}
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-xs text-gray-400 font-sans">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-800 truncate font-sans">{user.name}</p>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-brand-blue hover:bg-secondary transition-colors font-sans"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors font-sans"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    Profile
                  </Link>

                  {!isAdmin && (
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors font-sans"
                    >
                      <Package className="w-4 h-4 text-gray-400" />
                      My Orders
                    </Link>
                  )}

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                        navigate("/");
                      }}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors font-sans"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-full border border-gray-300 hover:border-gray-400 transition-colors font-sans"
              >
                Sign in
              </Link>
              <Link
                to="/login?tab=register"
                className="text-sm font-semibold text-white px-3 py-1.5 rounded-full transition-colors font-sans bg-brand-blue"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-2">
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
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-brand-blue hover:bg-secondary font-sans"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 font-sans"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  Profile
                </Link>
                {!isAdmin && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 font-sans"
                  >
                    <Package className="w-4 h-4 text-gray-400" />
                    My Orders
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                    navigate("/");
                  }}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 text-left font-sans"
                >
                  <LogOut className="w-4 h-4" />
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
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-center text-white hover:opacity-90 font-sans bg-brand-blue"
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
