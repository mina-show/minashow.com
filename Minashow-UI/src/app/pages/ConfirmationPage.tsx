import { Link } from 'react-router';
import { CheckCircle, ShoppingBag, Clock } from 'lucide-react';

export function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-10 text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#DCFCE7' }}>
            <CheckCircle className="w-10 h-10" style={{ color: '#22C55E' }} />
          </div>

          <h1
            className="text-gray-900 mb-3"
            style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '2rem', fontWeight: 700 }}
          >
            Order placed!
          </h1>

          <p
            className="text-gray-600 mb-8 leading-relaxed"
            style={{ fontFamily: 'Nunito, sans-serif', lineHeight: 1.7 }}
          >
            Thank you for your order. Our team will review it and send you a payment link via email
            within 1–2 business days.
          </p>

          {/* Steps */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left flex flex-col gap-4">
            {[
              {
                icon: <CheckCircle className="w-5 h-5" style={{ color: '#22C55E' }} />,
                title: 'Order received',
                desc: 'We have your order details.',
                done: true,
              },
              {
                icon: <Clock className="w-5 h-5" style={{ color: '#FACC15' }} />,
                title: 'Payment link on the way',
                desc: 'An admin will send you a payment link soon.',
                done: false,
              },
              {
                icon: <ShoppingBag className="w-5 h-5" style={{ color: '#2563EB' }} />,
                title: 'Order fulfilled',
                desc: 'After payment, we prepare and ship your order.',
                done: false,
              },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                {step.icon}
                <div>
                  <p
                    className="text-gray-800"
                    style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                  >
                    {step.title}
                  </p>
                  <p
                    className="text-gray-500 text-sm"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/dashboard"
              className="flex-1 py-3 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-center"
              style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
            >
              My orders
            </Link>
            <Link
              to="/shop"
              className="flex-1 py-3 rounded-full text-white transition-colors text-center hover:opacity-90"
              style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, backgroundColor: '#2563EB' }}
            >
              Back to shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}