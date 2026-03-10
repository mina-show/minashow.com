import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ShoppingCart, Package, Tag, ChevronRight } from "lucide-react";
import {
  getProductById,
  categories,
  getProductsByCategory,
} from "~/lib/data/products";
import { useCart } from "~/components/providers/cart-provider";
import { ImageWithFallback } from "~/components/misc/image-with-fallback";

export function meta() {
  return [{ title: "Product — Minashow" }];
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = id ? getProductById(id) : null;

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-sm text-gray-400 mb-8 font-sans"
          aria-label="Breadcrumb"
        >
          <Link to="/" className="hover:text-gray-700">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/shop" className="hover:text-gray-700">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          {cat && (
            <>
              <Link to={`/shop/${cat.id}`} className={`hover:text-gray-700 ${cat.textClass}`}>
                {cat.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
          <span className="text-gray-600 font-semibold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Image */}
          <div className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full h-80 sm:h-[420px] object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {cat && (
              <span
                className={`inline-flex items-center gap-1 text-sm ${cat.textClass} mb-3 font-sans font-bold`}
              >
                <Tag className="w-3.5 h-3.5" />
                {cat.name}
              </span>
            )}

            <h1
              className="text-gray-900 mb-4"
              style={{
                fontFamily: "Fredoka, sans-serif",
                fontSize: "2.25rem",
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              {product.name}
            </h1>

            <p className="text-gray-600 mb-6 leading-relaxed font-sans">
              {product.description}
            </p>

            {product.type && (
              <div className="flex items-center gap-2 mb-6">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500 font-sans">
                  Type:{" "}
                  <strong className="text-gray-700">{product.type}</strong>
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mb-8">
              <span
                className="text-gray-900"
                style={{
                  fontFamily: "Fredoka, sans-serif",
                  fontSize: "2.5rem",
                  fontWeight: 600,
                }}
              >
                ${product.price}
              </span>
              <span className="text-gray-400 text-sm ml-2 font-sans">USD</span>
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center bg-white border border-gray-200 rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors font-bold text-lg"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-10 text-center text-gray-900 font-sans font-bold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors font-bold text-lg"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full transition-all text-white font-sans font-extrabold"
                style={{ backgroundColor: added ? "#a9d937" : "#202973" }}
              >
                <ShoppingCart className="w-4 h-4" />
                {added ? "Added to cart!" : isInCart ? "Add more" : "Add to cart"}
              </button>
            </div>

            {isInCart && (
              <button
                onClick={() => navigate("/cart")}
                className="mt-3 text-sm text-brand-blue font-semibold text-center hover:underline font-sans"
              >
                View cart →
              </button>
            )}

            {/* Order process notice */}
            <div
              className="mt-8 p-4 rounded-2xl border"
              style={{ backgroundColor: "#FEFCE8", borderColor: "#FDE68A" }}
            >
              <p
                className="text-sm leading-relaxed font-sans"
                style={{ color: "#92400E" }}
              >
                After placing your order, our team will review it and send you a payment link
                via Zeffy within 1–2 business days. A PDF donation receipt will be provided
                for tax purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <h2
              className="text-gray-900 mb-6"
              style={{
                fontFamily: "Fredoka, sans-serif",
                fontSize: "1.5rem",
                fontWeight: 600,
              }}
            >
              More in {cat?.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all group"
                >
                  <div className="h-44 overflow-hidden">
                    <ImageWithFallback
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-gray-900 mb-1 font-sans font-bold">{p.name}</h3>
                    <p
                      className="text-gray-900 font-sans font-extrabold"
                    >
                      ${p.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
