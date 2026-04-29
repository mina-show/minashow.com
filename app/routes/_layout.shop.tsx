import { useState } from "react";
import { Link } from "react-router";
import { ShoppingCart, Music2, Sparkles, ChevronRight, Package } from "lucide-react";
import { packages } from "~/lib/data/packages";
import { products } from "~/lib/data/products";
import { useCart } from "~/components/providers/cart-provider";
import { ImageWithFallback } from "~/components/misc/image-with-fallback";

export function meta() {
  return [{ title: "Shop — Minashow" }];
}

export { ShopPage as default };

// Shared shop component — used by both /shop and /shop/:category
export function ShopPage({ initialCategory = "all" }: { initialCategory?: string }) {
  const { addItem } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  const soundtracks = products.filter((p) => p.category === "soundtracks");

  const handleAddSoundtrack = (id: string, name: string, image: string) => {
    addItem({ id, name, price: 0, image, category: "soundtracks" });
    setAddedId(id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f4ff" }}>
      {/* ─── Hero Banner ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-brand-blue">
        <div className="absolute inset-0 bg-dot-sm opacity-10" />

        {/* Decorative blobs */}
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20 animate-float"
          style={{ backgroundColor: "#fbf204" }}
        />
        <div
          className="absolute top-6 right-1/3 w-16 h-16 rounded-full opacity-25 animate-float-delayed"
          style={{ backgroundColor: "#fdb761" }}
        />
        <div
          className="absolute -bottom-10 left-10 w-44 h-44 rounded-full opacity-15 animate-float-slow"
          style={{ backgroundColor: "#a9d937" }}
        />
        <div
          className="absolute bottom-0 right-0 w-1/2 h-full opacity-[0.07]"
          style={{ background: "linear-gradient(135deg, transparent 50%, #fbf204 50%)" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-20">
          <div
            className="inline-flex items-center gap-1.5 text-brand-blue text-xs font-extrabold px-3 py-1.5 rounded-full mb-5 font-sans uppercase tracking-wider"
            style={{ backgroundColor: "#fbf204" }}
          >
            <Sparkles className="w-3 h-3" />
            The Minashow Store
          </div>

          <h1
            className="text-white mb-3 leading-none"
            style={{
              fontFamily: "Fredoka, sans-serif",
              fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
              fontWeight: 700,
              textShadow: "0 2px 24px rgba(0,0,0,0.18)",
            }}
          >
            Shop Everything
          </h1>
          <p className="text-white/70 font-sans text-lg max-w-md">
            Browser our packages and individual soundtracks for your next show.
          </p>
        </div>

        {/* Wavy bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg
            viewBox="0 0 1200 48"
            preserveAspectRatio="none"
            className="w-full h-8 sm:h-12"
            style={{ fill: "#f5f4ff" }}
          >
            <path d="M0,48 C200,0 600,48 900,16 C1050,0 1150,32 1200,12 L1200,48 Z" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* ─── Packages ─────────────────────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#202973" }}
            >
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2
                className="text-gray-900 leading-none"
                style={{ fontFamily: "Fredoka, sans-serif", fontSize: "1.6rem", fontWeight: 600 }}
              >
                Packages
              </h2>
              <p className="text-gray-500 text-sm font-sans mt-0.5">
                Costumes &amp; mascots bundled for your show
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => {
              const previewImages = pkg.images.slice(0, 4);
              const className = `group relative rounded-3xl overflow-hidden flex flex-col ${pkg.isDisabled ? "cursor-not-allowed grayscale opacity-50" : "card-lift"}`;
              const style = {
                backgroundColor: pkg.color,
                boxShadow: pkg.isDisabled ? "none" : `0 4px 24px ${pkg.color}45`,
                minHeight: "360px",
              };

              const cardContent = (
                <>
                  {/* Top dot pattern */}
                  <div className="absolute inset-0 bg-dot-sm opacity-[0.08]" />

                  {/* Decorative accent blob */}
                  <div
                    className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20"
                    style={{ backgroundColor: "#fbf204" }}
                  />

                  {/* Item count badge */}
                  <div className="relative p-6 pb-0">
                    <span
                      className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full font-sans"
                      style={{ backgroundColor: "rgba(255,255,255,0.18)", color: "#ffffff" }}
                    >
                      {pkg.images.length} items included
                    </span>
                  </div>

                  {/* Package name + subtitle */}
                  <div className="relative px-6 pt-4 pb-5">
                    <p
                      className="text-white/60 text-xs font-bold font-sans uppercase tracking-widest mb-1"
                    >
                      {pkg.subtitle}
                    </p>
                    <h3
                      className="text-white leading-tight"
                      style={{ fontFamily: "Fredoka, sans-serif", fontSize: "1.7rem", fontWeight: 700 }}
                    >
                      {pkg.name}
                    </h3>
                    <p className="text-white/70 text-sm font-sans mt-2 leading-relaxed line-clamp-2">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Item thumbnail strip */}
                  <div className="relative px-6 mt-auto pb-5">
                    <div className="flex items-center gap-2 mb-5">
                      {previewImages.map((img, idx) => (
                        <div
                          key={img.src}
                          className="w-14 h-14 rounded-xl overflow-hidden shrink-0"
                          style={{
                            boxShadow: "0 0 0 2px rgba(255,255,255,0.25)",
                            zIndex: previewImages.length - idx,
                          }}
                        >
                          <ImageWithFallback
                            src={img.src}
                            alt={img.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {pkg.images.length > 4 && (
                        <div
                          className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center text-xs font-extrabold font-sans"
                          style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#ffffff" }}
                        >
                          +{pkg.images.length - 4}
                        </div>
                      )}
                    </div>

                    {/* CTA row */}
                    <div
                      className="flex items-center justify-between px-4 py-3 rounded-2xl font-sans font-extrabold text-sm transition-all group-hover:gap-3"
                      style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#ffffff" }}
                    >
                      <span>View Package</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </>
              );

              return pkg.isDisabled ? (
                <div key={pkg.id} className={className} style={style}>
                  {cardContent}
                </div>
              ) : (
                <Link key={pkg.id} to={`/package/${pkg.id}`} className={className} style={style}>
                  {cardContent}
                </Link>
              );
            })}
          </div>
        </section>

        {/* ─── Soundtracks ──────────────────────────────────────────── */}
        {soundtracks.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                style={{ backgroundColor: "#fbf204" }}
              >
                <Music2 className="w-5 h-5 text-brand-blue" />
              </div>
              <div>
                <h2
                  className="text-gray-900 leading-none"
                  style={{ fontFamily: "Fredoka, sans-serif", fontSize: "1.6rem", fontWeight: 600 }}
                >
                  Soundtracks
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {soundtracks.map((p) => {
                const isAdded = addedId === p.id;
                return (
                  <div
                    key={p.id}
                    className="group relative rounded-3xl overflow-hidden card-lift"
                    style={{
                      backgroundColor: "#202973",
                      boxShadow: "0 4px 20px rgba(32,41,115,0.25)",
                    }}
                  >
                    <div className="h-1.5 w-full" style={{ backgroundColor: "#fbf204" }} />
                    <div className="p-5 flex gap-5">
                      <Link to={`/product/${p.id}`} className="shrink-0">
                        <div
                          className="w-20 h-20 rounded-2xl overflow-hidden"
                          style={{ boxShadow: "0 0 0 2px rgba(255,255,255,0.15)" }}
                        >
                          <ImageWithFallback
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        {p.type && (
                          <span
                            className="inline-block text-xs font-extrabold px-2.5 py-0.5 rounded-full mb-2 font-sans"
                            style={{ backgroundColor: "rgba(251,242,4,0.15)", color: "#fbf204" }}
                          >
                            {p.type}
                          </span>
                        )}
                        <Link to={`/product/${p.id}`}>
                          <h3
                            className="text-white mb-1 truncate transition-colors hover:text-brand-yellow"
                            style={{ fontFamily: "Fredoka, sans-serif", fontSize: "1.2rem", fontWeight: 600 }}
                          >
                            {p.name}
                          </h3>
                        </Link>
                        <p className="text-white/55 text-sm font-sans line-clamp-2 mb-3 leading-relaxed">
                          {p.description}
                        </p>
                        <button
                          onClick={() => handleAddSoundtrack(p.id, p.name, p.image)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold font-sans transition-all active:scale-95"
                          style={{
                            backgroundColor: isAdded ? "#a9d937" : "#fbf204",
                            color: isAdded ? "#ffffff" : "#202973",
                            boxShadow: isAdded
                              ? "0 4px 14px rgba(169,217,55,0.4)"
                              : "0 4px 14px rgba(251,242,4,0.3)",
                          }}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          {isAdded ? "Added!" : "Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="h-12" />
      </div>
    </div>
  );
}
