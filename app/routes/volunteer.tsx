import { useState } from "react";
import { Heart, CheckCircle } from "lucide-react";

export function meta() {
  return [{ title: "Volunteer — Minashow" }];
}

const INTERESTS = [
  "Costume making",
  "Puppet crafting",
  "Sound & music",
  "Show directing",
  "Logistics & shipping",
  "Social media",
  "Translation",
  "Other",
];

type FormState = { name: string; email: string; church: string; notes: string };

export default function VolunteerPage() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", church: "", notes: "" });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitted, setSubmitted] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const validate = (): Partial<FormState> => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.church.trim()) e.church = "Church name is required";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitted(true);
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const inputCls = (error?: string) =>
    `w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 outline-none transition-colors focus:border-red-400 focus:bg-white font-sans ${error ? "border-red-300" : "border-gray-200"
    }`;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "#f9eaec" }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: "#aa1324" }} />
          </div>
          <h2
            className="text-gray-900 mb-3"
            style={{ fontFamily: "Fredoka, sans-serif", fontSize: "1.75rem", fontWeight: 700 }}
          >
            Thank you, {form.name.split(" ")[0]}!
          </h2>
          <p className="text-gray-600 mb-6 font-sans" style={{ lineHeight: 1.7 }}>
            We've received your volunteer application and we're so glad you want to be part of the
            Minashow family. We'll be in touch soon.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({ name: "", email: "", church: "", notes: "" });
              setSelectedInterests([]);
            }}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors font-sans"
          >
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="relative py-14 bg-brand-red">
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
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1
              className="text-white"
              style={{ fontFamily: "Fredoka, sans-serif", fontSize: "2.25rem", fontWeight: 700 }}
            >
              Volunteer
            </h1>
          </div>
          <p className="max-w-xl font-sans" style={{ lineHeight: 1.7, color: "#f5d0d4" }}>
            Minashow is run entirely by volunteers who love serving the church. If you'd like to
            help, we'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Personal info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2
              className="text-gray-900 mb-5"
              style={{ fontFamily: "Fredoka, sans-serif", fontSize: "1.2rem", fontWeight: 600 }}
            >
              About you
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1.5 font-sans font-bold">
                  Full name
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
                  Email address
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
              <div>
                <label className="block text-gray-700 text-sm mb-1.5 font-sans font-bold">
                  Church
                </label>
                <input
                  type="text"
                  value={form.church}
                  onChange={(e) => handleChange("church", e.target.value)}
                  placeholder="e.g. St. George Church"
                  className={inputCls(errors.church)}
                />
                {errors.church && (
                  <p className="text-red-500 text-xs mt-1 font-sans">{errors.church}</p>
                )}
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2
              className="text-gray-900 mb-2"
              style={{ fontFamily: "Fredoka, sans-serif", fontSize: "1.2rem", fontWeight: 600 }}
            >
              Areas of interest
            </h2>
            <p className="text-gray-500 text-sm mb-4 font-sans">Select all that apply.</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => {
                const selected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full text-sm transition-all border font-sans ${selected
                        ? "text-white font-bold"
                        : "bg-white border-gray-200 text-gray-600 hover:border-red-300 font-semibold"
                      }`}
                    style={{
                      backgroundColor: selected ? "#aa1324" : undefined,
                      borderColor: selected ? "#aa1324" : undefined,
                    }}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <label className="block text-gray-700 text-sm mb-1.5 font-sans font-bold">
              Anything else you'd like to share?{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Tell us about yourself, your experience, or how you'd like to help..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none transition-colors focus:border-red-400 focus:bg-white resize-none font-sans"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-full transition-colors hover:opacity-90 font-sans font-extrabold"
            style={{ backgroundColor: "#aa1324" }}
          >
            <Heart className="w-4 h-4" />
            Submit application
          </button>
        </form>
      </div>
    </div>
  );
}
