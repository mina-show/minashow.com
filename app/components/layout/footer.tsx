import { Link } from "react-router";
import { Mail, Instagram, Facebook, Youtube } from "lucide-react";
import { LogoMark } from "./logo-mark";

const shopLinks = ["Mascots", "Costumes", "Soundtracks"] as const;

const supportLinks = [
  { label: "Contact Us", to: "/contact" },
  { label: "My Orders", to: "/dashboard" },
] as const;

const socialLinks = [
  { Icon: Facebook, bgClass: "bg-brand-blue", label: "Facebook" },
  { Icon: Instagram, bgClass: "bg-brand-red", label: "Instagram" },
  { Icon: Youtube, bgClass: "bg-brand-green", label: "YouTube" },
] as const;

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 font-display">
              <LogoMark size={32} />
              <span className="text-white text-xl font-bold">minashow</span>
            </Link>
            <p className="text-sm leading-relaxed font-sans">
              A non-profit store serving communities everywhere with everything they need for a
              great kids' show.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white mb-4 text-sm font-sans font-bold">Shop</h4>
            <ul className="flex flex-col gap-2 font-sans">
              {shopLinks.map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/shop/${cat.toLowerCase()}`}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white mb-4 text-sm font-sans font-bold">Support</h4>
            <ul className="flex flex-col gap-2 font-sans">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white mb-4 text-sm font-sans font-bold">Get in Touch</h4>
            <a
              href="mailto:hello@minashow.com"
              className="flex items-center gap-2 text-sm hover:text-white transition-colors mb-4 font-sans"
            >
              <Mail className="w-4 h-4" />
              hello@minashow.com
            </a>
            <div className="flex gap-3">
              {socialLinks.map(({ Icon, bgClass, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80 ${bgClass}`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-sans">
            © 2026 Minashow. A non-profit initiative. All rights reserved.
          </p>
          <div className="flex gap-4 font-sans">
            <a href="#" className="text-xs hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs hover:text-white transition-colors">
              Terms of Use
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
