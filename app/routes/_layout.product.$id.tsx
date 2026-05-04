import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ShoppingCart, ChevronRight, Minus, Plus, Tag } from "lucide-react";
import { getProductById, categories, getProductsByCategory } from "~/lib/data/products";
import { useCart } from "~/components/providers/cart-provider";
import { useAuth } from "~/components/providers/auth-provider";
import { ImageWithFallback } from "~/components/misc/image-with-fallback";

export function meta() {
  return [{ title: "Product — Minashow" }];
}

/** Visual tokens per category */
const CATEGORY_COLORS: Record<string, { bg: string; text: string; light: string; shadow: string }> = {
  mascots:    { bg: "#202973", text: "#ffffff", light: "#eef0f8", shadow: "rgba(32,41,115,0.35)"  },
  costumes:   { bg: "#aa1324", text: "#ffffff", light: "#fcedf0", shadow: "rgba(170,19,36,0.35)"  },
  soundtracks:{ bg: "#c49b00", text: "#202973", light: "#fffbe6", shadow: "rgba(196,155,0,0.35)"  },
  marionettes:{ bg: "#6a9e0f", text: "#ffffff", light: "#f0f8e0", shadow: "rgba(106,158,15,0.35)" },
};

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const { isAdmin } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = id ? getProductById(id) : null;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5f4ff" }}>
        <div className="text-center">
          <p className="text-gray-500 mb-4 font-sans">Product not found.</p>
          <Link to="/shop" className="text-brand-blue font-semibold font-sans">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const cat = categories.find((c) => c.id === product.category);
  const related = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isInCart = items.some((i) => i.id === product.id);
  const colors = CATEGORY_COLORS[product.category] ?? CATEGORY_COLORS.mascots;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f4ff" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ─── Breadcrumb ───────────────────────────────────────────── */}
        <nav
          className="flex items-center gap-1.5 text-sm text-gray-400 mb-8 font-sans"
          aria-label="Breadcrumb"
        >
          <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/shop" className="hover:text-gray-700 transition-colors">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          {cat && (
            <>
              <Link
                to={`/shop/${cat.id}`}
                className={`hover:text-gray-700 transition-colors font-semibold ${cat.textClass}`}
              >
                {cat.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
          <span className="text-gray-600 font-semibold">{product.name}</span>
        </nav>

        {/* ─── Main Product Layout ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 mb-20">

          {/* ── Image Showcase ── */}
          <div className="relative">
            {/* Tilted decorative backdrop */}
            <div
              className="absolute inset-2 rounded-3xl -rotate-2 opacity-25"
              style={{ backgroundColor: colors.bg }}
            />

            {/* Main image frame */}
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{ boxShadow: `0 24px 60px ${colors.shadow}` }}
            >
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-80 sm:h-[460px] object-cover"
              />
              {/* Subtle gradient for depth at image bottom */}
              <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Category floating badge — anchored to bottom-left of image */}
            {cat && (
              <div
                className="absolute -bottom-5 left-6 flex items-center gap-2 px-4 py-2.5 rounded-2xl font-sans font-bold text-sm shadow-lg"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                <Tag className="w-3.5 h-3.5" />
                {cat.name}
              </div>
            )}
          </div>

          {/* ── Product Details Panel ── */}
          <div className="flex flex-col pt-4 lg:pt-2">
            {/* Type chip */}
            {product.type && (
              <div
                className="inline-flex items-center gap-1.5 self-start text-xs font-extrabold px-3 py-1.5 rounded-full mb-4 font-sans"
                style={{ backgroundColor: colors.light, color: colors.bg }}
              >
                {product.type}
              </div>
            )}

            {/* Product name */}
            <h1
              className="mb-4 leading-none"
              style={{
                fontFamily: "Fredoka, sans-serif",
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              {product.name}
            </h1>

            <p className="text-gray-600 mb-8 leading-relaxed font-sans">
              {product.description}
            </p>

            {/* Divider */}
            <div className="mb-8 pb-1" style={{ borderBottom: "2px dashed #e5e7eb" }} />

            {/* Quantity + Add to cart — hidden from admins (admins don't purchase) */}
            {!isAdmin && (
              <>
                <div className="flex flex-wrap items-stretch gap-3 mb-3">
                  {/* Qty stepper */}
                  <div
                    className="flex items-center rounded-2xl overflow-hidden bg-white"
                    style={{ border: "2px solid #e5e7eb" }}
                  >
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-gray-900 font-extrabold font-sans text-lg select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* CTA button */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2.5 py-3 px-6 rounded-2xl font-extrabold font-sans text-base transition-all active:scale-[0.97]"
                    style={{
                      backgroundColor: added ? "#a9d937" : colors.bg,
                      color: added ? "#ffffff" : colors.text,
                      boxShadow: added
                        ? "0 8px 28px rgba(169,217,55,0.45)"
                        : `0 8px 28px ${colors.shadow}`,
                      minHeight: "48px",
                    }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {added ? "✓ Added to cart!" : isInCart ? "Add more" : "Add to cart"}
                  </button>
                </div>

                {isInCart && !added && (
                  <button
                    onClick={() => navigate("/cart")}
                    className="text-sm font-semibold text-center hover:underline font-sans mb-2 transition-opacity hover:opacity-70"
                    style={{ color: colors.bg }}
                  >
                    View cart →
                  </button>
                )}
              </>
            )}

            {/* Order process notice */}
            <div
              className="mt-auto pt-6 p-5 rounded-2xl"
              style={{ backgroundColor: "#fffbe6", border: "1.5px solid #fde68a" }}
            >
              <p className="text-sm leading-relaxed font-sans" style={{ color: "#78350f" }}>
                <span className="font-extrabold">How it works:</span> After placing your order, our
                team will review it and send you a payment link via Zeffy within 1–2 business days.
                A PDF donation receipt will be provided for tax purposes.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Related Products ─────────────────────────────────────── */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <h2
                className="text-gray-900"
                style={{
                  fontFamily: "Fredoka, sans-serif",
                  fontSize: "1.75rem",
                  fontWeight: 600,
                }}
              >
                More in {cat?.name}
              </h2>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="group bg-white rounded-3xl overflow-hidden card-lift"
                  style={{
                    border: "1.5px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* Category color top bar */}
                  <div className="h-1.5 w-full" style={{ backgroundColor: colors.bg }} />
                  <div className="h-44 overflow-hidden">
                    <ImageWithFallback
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3
                      className="text-gray-900"
                      style={{
                        fontFamily: "Fredoka, sans-serif",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                      }}
                    >
                      {p.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="h-12" />
      </div>
    </div>
  );
}
