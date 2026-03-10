import { Link } from "react-router";
import { CheckCircle, ShoppingBag, Clock } from "lucide-react";

export function meta() {
  return [{ title: "Order Placed — Minashow" }];
}

const steps = [
  {
    icon: <CheckCircle className="w-5 h-5 shrink-0" style={{ color: "#a9d937" }} />,
    title: "Order received",
    desc: "We have your order details.",
    done: true,
  },
  {
    icon: <Clock className="w-5 h-5 shrink-0" style={{ color: "#fbf204" }} />,
    title: "Zeffy payment link on the way",
    desc: "An admin will send you a donation payment link within 1–2 business days.",
    done: false,
  },
  {
    icon: <ShoppingBag className="w-5 h-5 shrink-0" style={{ color: "#202973" }} />,
    title: "Invoice & fulfillment",
    desc: "After payment, we generate your PDF donation receipt and prepare your order.",
    done: false,
  },
] as const;

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-10 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "#e8f5bc" }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: "#a9d937" }} />
          </div>

          <h1
            className="text-gray-900 mb-3"
            style={{
              fontFamily: "Fredoka, sans-serif",
              fontSize: "2rem",
              fontWeight: 700,
            }}
          >
            Order placed!
          </h1>

          <p
            className="text-gray-600 mb-8 leading-relaxed font-sans"
            style={{ lineHeight: 1.7 }}
          >
            Thank you for your order. Our team will review it and send you a Zeffy donation
            payment link via email within 1–2 business days. A PDF donation receipt will be
            issued for your tax records.
          </p>

          {/* Process steps */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left flex flex-col gap-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                {step.icon}
                <div>
                  <p className="text-gray-800 font-sans font-bold">{step.title}</p>
                  <p className="text-gray-500 text-sm font-sans">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/dashboard"
              className="flex-1 py-3 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-center font-sans font-bold"
            >
              My orders
            </Link>
            <Link
              to="/shop"
              className="flex-1 py-3 rounded-full text-white transition-colors text-center hover:opacity-90 font-sans font-extrabold"
              style={{ backgroundColor: "#202973" }}
            >
              Back to shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
