import { Link, useNavigate } from "react-router";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "~/components/providers/cart-provider";
import { ImageWithFallback } from "~/components/misc/image-with-fallback";

export function meta() {
  return [{ title: "Your Cart — Minashow" }];
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, count } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-secondary">
            <ShoppingBag className="w-10 h-10 text-brand-blue" />
          </div>
          <h2 className="text-gray-900 mb-2 font-display text-[1.75rem] font-semibold">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-6 font-sans">
            Looks like you haven't added anything yet.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-full transition-colors hover:opacity-90 font-sans font-extrabold"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse the shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-gray-900 mb-8 font-display text-[2rem] font-bold">Your cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items list */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.id}`}>
                    <h3 className="text-gray-900 hover:text-brand-blue transition-colors truncate font-sans font-bold">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-gray-500 text-sm capitalize font-sans">{item.category}</p>
                  <p className="text-gray-900 mt-1 font-sans font-extrabold">${item.price}</p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center bg-gray-100 rounded-full overflow-hidden shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors font-bold"
                    aria-label="Decrease"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-gray-900 font-sans font-bold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors font-bold"
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>

                {/* Line total */}
                <span className="text-gray-900 shrink-0 w-16 text-right hidden sm:block font-sans font-extrabold">
                  ${item.price * item.quantity}
                </span>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20">
              <h2 className="text-gray-900 mb-4 font-display text-xl font-semibold">
                Order summary
              </h2>

              <div className="flex flex-col gap-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm font-sans">Items ({count})</span>
                  <span className="text-gray-700 text-sm font-sans font-semibold">${total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm font-sans">Shipping</span>
                  <span className="text-gray-500 text-sm font-sans">Discussed with admin</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-900 font-sans font-bold">Total</span>
                  <span className="text-gray-900 font-display text-xl font-semibold">
                    ${total}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full flex items-center justify-center gap-2 bg-brand-blue text-white py-3 rounded-full transition-colors hover:opacity-90 font-sans font-extrabold"
              >
                Proceed to checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/shop"
                className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-3 transition-colors font-sans"
              >
                Continue shopping
              </Link>

              <div className="mt-6 p-3 rounded-xl border bg-yellow-50 border-yellow-200">
                <p className="text-xs leading-relaxed font-sans text-amber-800">
                  Payment is handled after order review. You'll receive a Zeffy payment link
                  from our team and a PDF donation receipt for your taxes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
