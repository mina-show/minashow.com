import { Link } from "react-router";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { categories } from "~/lib/data/products";
import { ImageWithFallback } from "~/components/misc/image-with-fallback";

export function meta() {
  return [
    { title: "Minashow — Kids Show Materials" },
    {
      name: "description",
      content: "Mascots, costumes, and soundtracks for communities everywhere.",
    },
  ];
}

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative min-h-[75vh] flex flex-col justify-center overflow-hidden bg-brand-blue">
        <div className="absolute inset-0 opacity-20 bg-dot-lg" />

        <div className="absolute bottom-[60px] left-0 right-0 h-1.5 flex">
          <div className="flex-1 bg-brand-red" />
          <div className="flex-1 bg-brand-yellow" />
          <div className="flex-1 bg-brand-green" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-white mb-6 font-display text-[clamp(2.5rem,5vw,4rem)] font-bold leading-[1.1]">
              Bring the show to life
            </h1>
            <p className="mb-8 max-w-md font-sans text-[1.1rem] leading-[1.7] text-blue-100">
              Everything you need for a great kids' show, from mascots, costumes, and soundtracks.
              Made for communities everywhere that care about quality.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-white text-brand-blue px-6 py-3 rounded-full hover:bg-secondary transition-colors font-sans font-extrabold"
              >
                <ShoppingBag className="w-4 h-4" />
                Browse the shop
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              <div className="absolute -inset-3 rounded-3xl bg-brand-gradient opacity-60" />
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
            <h2 className="text-gray-900 mb-2 font-display text-[2rem] font-semibold">
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
                  <h3 className={`${cat.textClass} mb-1 font-display text-[1.2rem] font-semibold`}>
                    {cat.name}
                  </h3>
                  <p className="text-gray-500 text-sm font-sans">{cat.description}</p>
                </div>
                <span className={`inline-flex items-center gap-1 text-sm ${cat.textClass} font-sans font-bold`}>
                  Browse {cat.name} <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
