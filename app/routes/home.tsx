import { Link } from "react-router";
import { ArrowRight, ShoppingBag, Music } from "lucide-react";
import { categories } from "~/lib/data/products";
import { ImageWithFallback } from "~/components/misc/image-with-fallback";

const testimonials = [
  {
    id: 1,
    quote:
      "We ordered the lion mascot and the kids absolutely loved it. Our Easter show was a huge hit.",
    name: "Deacon Michael Fawzy",
    church: "St. Mark Coptic Church — Cairo",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
  {
    id: 2,
    quote:
      "The soundtracks are so well made. We've been using them for two years now and they still get the kids excited.",
    name: "Mother Mariam Samir",
    church: "St. George Church — Alexandria",
    bg: "#f9eaec",
    border: "#FECACA",
  },
  {
    id: 3,
    quote:
      "Ordering was simple and the team was very helpful. The angel marionette is a work of art.",
    name: "Father Boulos Aziz",
    church: "Holy Family Church — Hurghada",
    bg: "#f2fae3",
    border: "#cfe87a",
  },
] as const;

export function meta() {
  return [
    { title: "Minashow — Kids Show Materials for Churches" },
    {
      name: "description",
      content:
        "Mascots, costumes, soundtracks, and marionettes for Arabic-speaking churches.",
    },
  ];
}

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────── */}
      <section
        className="relative min-h-[75vh] flex flex-col justify-center overflow-hidden bg-brand-blue"
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="absolute bottom-[60px] left-0 right-0 h-1.5 flex">
          <div className="flex-1" style={{ backgroundColor: "#aa1324" }} />
          <div className="flex-1" style={{ backgroundColor: "#fbf204" }} />
          <div className="flex-1" style={{ backgroundColor: "#a9d937" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* <p
              className="mb-4 text-sm tracking-widest uppercase font-sans font-bold"
              style={{ color: "#BFDBFE" }}
            >
              For Arabic-speaking churches
            </p> */}
            <h1
              className="text-white mb-6"
              style={{
                fontFamily: "Fredoka, sans-serif",
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              Bring faith to the stage
            </h1>
            <p
              className="mb-8 max-w-md font-sans"
              style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "#DBEAFE" }}
            >
              Everything you need for a great kids' show — mascots, costumes, soundtracks, and
              handcrafted marionettes. Made for churches that care about quality.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full hover:bg-secondary transition-colors font-sans font-extrabold"
                style={{ color: "#202973" }}
              >
                <ShoppingBag className="w-4 h-4" />
                Browse the shop
              </Link>
              <Link
                to="/sounds"
                className="inline-flex items-center gap-2 border-2 border-white/40 text-white px-6 py-3 rounded-full hover:bg-white/10 transition-colors font-sans font-bold"
              >
                <Music className="w-4 h-4" />
                Listen to sounds
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              <div
                className="absolute -inset-3 rounded-3xl"
                style={{
                  background:
                    "linear-gradient(135deg, #aa1324, #fbf204, #a9d937, #202973)",
                  opacity: 0.6,
                }}
              />
              <div className="relative w-80 h-80 rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="./mina-show-logo.png"
                  alt="Kids show mascots"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg className="block border-b-0" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60V20C360 60 1080 0 1440 20V60H0Z" fill="#F9FAFB" />
          </svg>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <h2
              className="text-gray-900 mb-2"
              style={{
                fontFamily: "Fredoka, sans-serif",
                fontSize: "2rem",
                fontWeight: 600,
              }}
            >
              What we carry
            </h2>
            <p className="text-gray-500 font-sans">
              Browse by category and find exactly what your show needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop/${cat.id}`}
                className={`group rounded-2xl border ${cat.borderClass} ${cat.bgClass} p-5 flex flex-col gap-4 hover:shadow-md transition-all`}
              >
                <div className="w-full h-44 rounded-xl overflow-hidden">
                  <ImageWithFallback
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h3
                    className={`${cat.textClass} mb-1`}
                    style={{
                      fontFamily: "Fredoka, sans-serif",
                      fontSize: "1.2rem",
                      fontWeight: 600,
                    }}
                  >
                    {cat.name}
                  </h3>
                  <p className="text-gray-500 text-sm font-sans">{cat.description}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-sm ${cat.textClass} font-sans font-bold`}
                >
                  Browse {cat.name} <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shop CTA — Yellow ─────────────────────────────────── */}
      {/* <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div
            className="rounded-3xl p-8 sm:p-12 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center overflow-hidden relative"
            style={{ backgroundColor: "#fbf204" }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="relative">
              <h2
                className="text-white mb-3"
                style={{
                  fontFamily: "Fredoka, sans-serif",
                  fontSize: "2rem",
                  fontWeight: 700,
                }}
              >
                Ready to plan your next show?
              </h2>
              <p className="mb-6 font-sans" style={{ lineHeight: 1.7, color: "#713F12" }}>
                We handle the details so you can focus on what matters — making kids' events
                memorable.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full hover:bg-yellow-50 transition-colors font-sans font-extrabold"
                style={{ color: "#CA8A04" }}
              >
                <ShoppingBag className="w-4 h-4" />
                Go to shop
              </Link>
            </div>
            <div className="relative hidden sm:block">
              <div className="w-full h-52 rounded-2xl overflow-hidden shadow-lg">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1701773055020-9d2b09b7ca5e?w=800"
                  alt="Kids show"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* ── Testimonials ──────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <h2
              className="text-gray-900 mb-2"
              style={{
                fontFamily: "Fredoka, sans-serif",
                fontSize: "2rem",
                fontWeight: 600,
              }}
            >
              From our churches
            </h2>
            <p className="text-gray-500 font-sans">
              A few words from the people we've been honored to serve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="border rounded-2xl p-6 flex flex-col gap-4"
                style={{ backgroundColor: t.bg, borderColor: t.border }}
              >
                <p className="text-gray-700 leading-relaxed font-sans italic">
                  "{t.quote}"
                </p>
                <div>
                  <p className="text-gray-900 font-sans font-bold">{t.name}</p>
                  <p className="text-gray-500 text-sm font-sans">{t.church}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sounds Teaser — Green ─────────────────────────────── */}
      {/* <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div
            className="rounded-3xl overflow-hidden relative"
            style={{ backgroundColor: "#a9d937" }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="relative p-8 sm:p-12 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
              <div>
                <h2
                  className="text-white mb-3"
                  style={{
                    fontFamily: "Fredoka, sans-serif",
                    fontSize: "2rem",
                    fontWeight: 700,
                  }}
                >
                  Listen to our sounds
                </h2>
                <p
                  className="mb-6 font-sans"
                  style={{ lineHeight: 1.7, color: "#e8f5bc" }}
                >
                  Stream our library of Arabic kids' praise tracks and show music directly in
                  your browser. No downloads required.
                </p>
                <Link
                  to="/sounds"
                  className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full hover:bg-green-50 transition-colors font-sans font-extrabold"
                  style={{ color: "#5a7820" }}
                >
                  <Music className="w-4 h-4" />
                  Open sounds
                </Link>
              </div>
              <div className="hidden sm:block">
                <div className="w-full h-52 rounded-2xl overflow-hidden shadow-lg">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1571766752116-63b1e6514b53?w=800"
                    alt="Music"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}
