import { Link } from 'react-router';
import { Mail, Instagram, Facebook, Youtube } from 'lucide-react';

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

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="flex items-center gap-2 mb-4"
              style={{ fontFamily: 'Fredoka, sans-serif' }}
            >
              <LogoMark size={32} />
              <span className="text-white" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                minashow
              </span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ fontFamily: 'Nunito, sans-serif' }}>
              A non-profit store serving Arabic-speaking churches with everything they need for a
              great kids' show.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4
              className="text-white mb-4 text-sm"
              style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
            >
              Shop
            </h4>
            <ul className="flex flex-col gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {['Mascots', 'Costumes', 'Soundtracks', 'Marionettes'].map((cat) => (
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
            <h4
              className="text-white mb-4 text-sm"
              style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
            >
              Support
            </h4>
            <ul className="flex flex-col gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {[
                { label: 'Contact Us', to: '/contact' },
                { label: 'Volunteer', to: '/volunteer' },
                { label: 'My Orders', to: '/dashboard' },
                { label: 'Sounds', to: '/sounds' },
              ].map((link) => (
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
            <h4
              className="text-white mb-4 text-sm"
              style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
            >
              Get in Touch
            </h4>
            <a
              href="mailto:hello@minashow.com"
              className="flex items-center gap-2 text-sm hover:text-white transition-colors mb-4"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              <Mail className="w-4 h-4" />
              hello@minashow.com
            </a>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: '#2563EB' }}
              >
                <Facebook className="w-4 h-4 text-white" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: '#EF4444' }}
              >
                <Instagram className="w-4 h-4 text-white" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: '#22C55E' }}
              >
                <Youtube className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ fontFamily: 'Nunito, sans-serif' }}>
            © 2026 Minashow. A non-profit initiative. All rights reserved.
          </p>
          <div className="flex gap-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
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