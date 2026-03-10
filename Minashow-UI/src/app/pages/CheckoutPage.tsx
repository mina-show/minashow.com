import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    church: user?.church || '',
    email: user?.email || '',
    phone: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.church.trim()) e.church = 'Church name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      clearCart();
      navigate('/confirmation');
    }, 800);
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  if (items.length === 0) {
    navigate('/shop');
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1
          className="text-gray-900 mb-8"
          style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '2rem', fontWeight: 700 }}
        >
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2
                className="text-gray-900 mb-5"
                style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.2rem', fontWeight: 600 }}
              >
                Your details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label
                    className="block text-gray-700 text-sm mb-1.5"
                    style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                  >
                    Full name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g. Mary Hanna"
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 outline-none transition-colors focus:border-blue-400 focus:bg-white ${
                      errors.name ? 'border-red-300' : 'border-gray-200'
                    }`}
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Church */}
                <div className="sm:col-span-2">
                  <label
                    className="block text-gray-700 text-sm mb-1.5"
                    style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                  >
                    Church name
                  </label>
                  <input
                    type="text"
                    value={form.church}
                    onChange={(e) => handleChange('church', e.target.value)}
                    placeholder="e.g. St. Mark Church — Cairo"
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 outline-none transition-colors focus:border-blue-400 focus:bg-white ${
                      errors.church ? 'border-red-300' : 'border-gray-200'
                    }`}
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  />
                  {errors.church && (
                    <p className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      {errors.church}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    className="block text-gray-700 text-sm mb-1.5"
                    style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="you@church.org"
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 outline-none transition-colors focus:border-blue-400 focus:bg-white ${
                      errors.email ? 'border-red-300' : 'border-gray-200'
                    }`}
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    className="block text-gray-700 text-sm mb-1.5"
                    style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                  >
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+20 100 000 0000"
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 outline-none transition-colors focus:border-blue-400 focus:bg-white ${
                      errors.phone ? 'border-red-300' : 'border-gray-200'
                    }`}
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label
                    className="block text-gray-700 text-sm mb-1.5"
                    style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                  >
                    Notes{' '}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Any special requests or questions..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none transition-colors focus:border-blue-400 focus:bg-white resize-none"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 rounded-full transition-colors ${
                submitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800 }}
            >
              {submitting ? 'Placing order...' : 'Place order'}
            </button>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20">
              <h2
                className="text-gray-900 mb-4"
                style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.2rem', fontWeight: 600 }}
              >
                Order summary
              </h2>

              <div className="flex flex-col gap-3 mb-5">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-gray-800 text-sm truncate"
                        style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                      >
                        {item.name}
                      </p>
                      <p
                        className="text-gray-400 text-xs"
                        style={{ fontFamily: 'Nunito, sans-serif' }}
                      >
                        Qty {item.quantity}
                      </p>
                    </div>
                    <span
                      className="text-gray-800 text-sm shrink-0"
                      style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                    >
                      ${item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span
                    className="text-gray-700"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
