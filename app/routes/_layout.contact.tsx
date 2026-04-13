import { useState } from "react";
import { Mail, MessageSquare, CheckCircle } from "lucide-react";

export function meta() {
  return [{ title: "Contact — Minashow" }];
}

type FormState = { name: string; email: string; subject: string; message: string };

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): Partial<FormState> => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.message.trim()) e.message = "Required";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    // Phase 3: wire to AWS SES
    setSubmitted(true);
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const inputCls = (error?: string) =>
    `w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 outline-none transition-colors focus:border-brand-orange focus:bg-white font-sans ${error ? "border-red-300" : "border-gray-200"
    }`;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "#fdb76133" }}
          >
            <CheckCircle className="w-10 h-10 text-brand-orange" />
          </div>
          <h2
            className="text-gray-900 mb-3"
            style={{ fontFamily: "Fredoka, sans-serif", fontSize: "1.75rem", fontWeight: 700 }}
          >
            Message sent!
          </h2>
          <p className="text-gray-600 mb-6 font-sans" style={{ lineHeight: 1.7 }}>
            Thank you for reaching out. We'll get back to you as soon as we can.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({ name: "", email: "", subject: "", message: "" });
            }}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors font-sans"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="relative py-14 bg-brand-orange">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5" style={{ color: "#713F12" }} />
            </div>
            <h1
              className="text-white"
              style={{ fontFamily: "Fredoka, sans-serif", fontSize: "2.25rem", fontWeight: 700 }}
            >
              Contact
            </h1>
          </div>
          <p className="max-w-xl font-sans" style={{ lineHeight: 1.7, color: "#ffffff" }}>
            Have a question about an order, a product, or our team? We'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm mb-1.5 font-sans font-bold">
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Your name"
                className={inputCls(errors.name)}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1 font-sans">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1.5 font-sans font-bold">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="you@example.com"
                className={inputCls(errors.email)}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-sans">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1.5 font-sans font-bold">
              Subject{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              placeholder="e.g. Order question"
              className={inputCls()}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1.5 font-sans font-bold">
              Message
            </label>
            <textarea
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="How can we help?"
              rows={5}
              className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 outline-none transition-colors focus:border-brand-orange focus:bg-white resize-none font-sans ${errors.message ? "border-red-300" : "border-gray-200"
                }`}
            />
            {errors.message && (
              <p className="text-red-500 text-xs mt-1 font-sans">{errors.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-full transition-colors hover:opacity-90 font-sans font-extrabold"
            style={{ backgroundColor: "var(--brand-orange)" }}
          >
            <MessageSquare className="w-4 h-4" />
            Send message
          </button>
        </form>

        {/* Direct contact */}
        <div className="mt-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-gray-500 text-sm mb-1 font-sans">Email us directly</p>
            <a
              href="mailto:hello@minashow.com"
              className="font-semibold transition-colors hover:opacity-80 font-sans text-brand-orange"
            >
              hello@minashow.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
