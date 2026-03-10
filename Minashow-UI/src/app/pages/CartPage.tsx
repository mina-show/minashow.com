import { Link, useNavigate } from 'react-router';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function CartPage() {
  const { items, removeItem, updateQuantity, total, count } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#EFF6FF' }}>
            <ShoppingBag className="w-10 h-10" style={{ color: '#2563EB' }} />
          </div>
          <h2
            className="text-gray-900 mb-2"
            style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.75rem', fontWeight: 600 }}
          >
            Your cart is empty
          </h2>
          <p
            className="text-gray-500 mb-6"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Looks like you haven't added anything yet.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full transition-colors hover:opacity-90"
            style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, backgroundColor: '#2563EB' }}
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
        <h1
          className="text-gray-900 mb-8"
          style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '2rem', fontWeight: 700 }}
        >
          Your cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
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
                    <h3
                      className="text-gray-900 hover:text-blue-600 transition-colors truncate"
                      style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                    >
                      {item.name}
                    </h3>
                  </Link>
                  <p
                    className="text-gray-500 text-sm capitalize"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    {item.category}
                  </p>
                  <p
                    className="text-gray-900 mt-1"
                    style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800 }}
                  >
                    ${item.price}
                  </p>
                </div>

                {/* Quantity */}
                <div className="flex items-center bg-gray-100 rounded-full overflow-hidden shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                    style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                  >
                    −
                  </button>
                  <span
                    className="w-8 text-center text-gray-900"
                    style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                  >
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                    style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <span
                  className="text-gray-900 shrink-0 w-16 text-right hidden sm:block"
                  style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800 }}
                >
                  ${item.price * item.quantity}
                </span>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20">
              <h2
                className="text-gray-900 mb-4"
                style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.25rem', fontWeight: 600 }}
              >
                Order summary
              </h2>

              <div className="flex flex-col gap-3 mb-6">
                <div className="flex justify-between">
                  <span
                    className="text-gray-500 text-sm"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    Items ({count})
                  </span>
                  <span
                    className="text-gray-700 text-sm"
                    style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}
                  >
                    ${total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className="text-gray-500 text-sm"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    Shipping
                  </span>
                  <span
                    className="text-gray-500 text-sm"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    Discussed with admin
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between">
                  <span
                    className="text-gray-900"
                    style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                  >
                    Total
                  </span>
                  <span
                    className="text-gray-900"
                    style={{
                      fontFamily: 'Fredoka, sans-serif',
                      fontWeight: 600,
                      fontSize: '1.25rem',
                    }}
                  >
                    ${total}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center gap-2 text-white py-3 rounded-full transition-colors hover:opacity-90"
                style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, backgroundColor: '#2563EB' }}
              >
                Proceed to checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/shop"
                className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-3 transition-colors"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Continue shopping
              </Link>

              <div className="mt-6 p-3 rounded-xl border" style={{ backgroundColor: '#FEFCE8', borderColor: '#FDE68A' }}>
                <p
                  className="text-xs leading-relaxed"
                  style={{ fontFamily: 'Nunito, sans-serif', color: '#92400E' }}
                >
                  Payment is handled after order review. You'll receive a payment link via email
                  from our team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}