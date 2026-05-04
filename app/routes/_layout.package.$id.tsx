import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ShoppingCart, ChevronRight, ChevronLeft, X } from "lucide-react";
import { getPackageById } from "~/lib/data/packages";
import { useCart } from "~/components/providers/cart-provider";
import { useAuth } from "~/components/providers/auth-provider";
import { ImageWithFallback } from "~/components/misc/image-with-fallback";

export function meta() {
  return [{ title: "Package — Minashow" }];
}

export default function PackageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const { isAdmin } = useAuth();
  const [added, setAdded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const pkg = id ? getPackageById(id) : null;

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(() =>
    setLightboxIndex((i) => (i !== null && pkg ? (i - 1 + pkg.images.length) % pkg.images.length : i)),
    [pkg]
  );
  const next = useCallback(() =>
    setLightboxIndex((i) => (i !== null && pkg ? (i + 1) % pkg.images.length : i)),
    [pkg]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, closeLightbox, prev, next]);

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5f4ff" }}>
        <div className="text-center">
          <p className="text-gray-500 mb-4 font-sans">Package not found.</p>
          <Link to="/shop" className="text-brand-blue font-semibold font-sans">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const isInCart = items.some((i) => i.id === `pkg-${pkg.id}`);
  const activeImage = lightboxIndex !== null ? pkg.images[lightboxIndex] : null;

  const handleRequest = () => {
    addItem({
      id: `pkg-${pkg.id}`,
      name: pkg.name,
      price: 0,
      image: pkg.images[0]?.src ?? "",
      category: "package",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f4ff" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-8 font-sans" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/shop" className="hover:text-gray-600 transition-colors">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-700 font-semibold">{pkg.name}</span>
        </nav>

        {/* Package header */}
        <h1
          className="mb-3 leading-none"
          style={{
            fontFamily: "Fredoka, sans-serif",
            fontSize: "clamp(2rem, 6vw, 3rem)",
            fontWeight: 700,
            color: pkg.color,
          }}
        >
          {pkg.name}
        </h1>
        <p className="text-gray-500 font-sans text-base max-w-xl leading-relaxed mb-6">
          {pkg.description}
        </p>

        {/* Add to cart — hidden from admins (admins don't purchase) */}
        {!isAdmin && (
          <div className="flex items-center gap-3 mb-12">
            <button
              onClick={handleRequest}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-extrabold font-sans text-base transition-all active:scale-[0.97]"
              style={{
                backgroundColor: added ? "#a9d937" : pkg.color,
                color: "#ffffff",
                boxShadow: added
                  ? "0 6px 20px rgba(169,217,55,0.4)"
                  : `0 6px 20px ${pkg.color}45`,
              }}
            >
              <ShoppingCart className="w-5 h-5" />
              {added ? "✓ Added to cart!" : isInCart ? "Added — add again" : "Add to Cart"}
            </button>

            {isInCart && !added && (
              <button
                onClick={() => navigate("/cart")}
                className="text-sm font-semibold font-sans text-gray-400 hover:text-gray-600 transition-colors"
              >
                View cart →
              </button>
            )}
          </div>
        )}

        {/* Gallery */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {pkg.images.map((img, idx) => (
            <button
              key={img.src}
              onClick={() => setLightboxIndex(idx)}
              className="flex flex-col gap-2 text-left group"
            >
              <div
                className="rounded-2xl overflow-hidden aspect-square bg-white transition-transform duration-200 group-hover:scale-[1.03]"
                style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}
              >
                <ImageWithFallback
                  src={img.src}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-gray-800 text-sm font-semibold font-sans text-center leading-tight">
                {img.name}
              </p>
            </button>
          ))}
        </div>

        <div className="h-16" />
      </div>

      {/* Lightbox */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.88)" }}
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          {/* Image */}
          <div
            className="max-w-3xl max-h-[85vh] mx-16 flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage.src}
              alt={activeImage.name}
              className="max-h-[78vh] max-w-full rounded-2xl object-contain"
              style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
            />
            <p className="text-white/80 font-sans text-sm font-semibold">
              {activeImage.name}
              <span className="text-white/40 ml-2">
                {lightboxIndex! + 1} / {pkg.images.length}
              </span>
            </p>
          </div>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      )}
    </div>
  );
}
