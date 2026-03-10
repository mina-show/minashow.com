import { useState } from 'react';
import { Mail, MessageSquare, CheckCircle } from 'lucide-react';

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.message.trim()) e.message = 'Required';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitted(true);
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: '#FEF9C3' }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: '#CA8A04' }} />
          </div>
          <h2 className="text-gray-900 mb-3" style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.75rem', fontWeight: 700 }}>
            Message sent!
          </h2>
          <p className="text-gray-600 mb-6" style={{ fontFamily: 'Nunito, sans-serif', lineHeight: 1.7 }}>
            Thank you for reaching out. We'll get back to you as soon as we can.
          </p>
          <button
            onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
            className="text-sm text-gray-400 hover:text-gray-600"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="relative py-14" style={{ backgroundColor: '#FACC15' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5" style={{ color: '#713F12' }} />
            </div>
            <h1 className="text-white" style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '2.25rem', fontWeight: 700 }}>Contact</h1>
          </div>
          <p style={{ fontFamily: 'Nunito, sans-serif', lineHeight: 1.7, color: '#713F12', maxWidth: '36rem' }}>
            Have a question about an order, a product, or the ministry? We'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm mb-1.5" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>Name</label>
              <input
                type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Your name"
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 outline-none transition-colors focus:bg-white ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                style={{ fontFamily: 'Nunito, sans-serif' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#FACC15'}
                onBlur={(e) => e.currentTarget.style.borderColor = errors.name ? '#FCA5A5' : '#E5E7EB'}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>{errors.name}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1.5" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>Email</label>
              <input
                type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 outline-none transition-colors focus:bg-white ${errors.email ? 'border-red-300' : 'border-gray-200'}`}
                style={{ fontFamily: 'Nunito, sans-serif' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#FACC15'}
                onBlur={(e) => e.currentTarget.style.borderColor = errors.email ? '#FCA5A5' : '#E5E7EB'}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>{errors.email}</p>}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1.5" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>Subject <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="text" value={form.subject} onChange={(e) => handleChange('subject', e.target.value)}
              placeholder="e.g. Order question"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none transition-colors focus:bg-white"
              style={{ fontFamily: 'Nunito, sans-serif' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#FACC15'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1.5" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>Message</label>
            <textarea
              value={form.message} onChange={(e) => handleChange('message', e.target.value)}
              placeholder="How can we help?"
              rows={5}
              className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 outline-none transition-colors focus:bg-white resize-none ${errors.message ? 'border-red-300' : 'border-gray-200'}`}
              style={{ fontFamily: 'Nunito, sans-serif' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#FACC15'}
              onBlur={(e) => e.currentTarget.style.borderColor = errors.message ? '#FCA5A5' : '#E5E7EB'}
            />
            {errors.message && <p className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>{errors.message}</p>}
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-full transition-colors hover:opacity-90"
            style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, backgroundColor: '#CA8A04' }}
          >
            <MessageSquare className="w-4 h-4" />
            Send message
          </button>
        </form>

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-gray-500 text-sm mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>Email us directly</p>
            <a href="mailto:hello@minashow.com" className="text-gray-900 font-semibold transition-colors hover:opacity-80" style={{ fontFamily: 'Nunito, sans-serif', color: '#CA8A04' }}>
              hello@minashow.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
