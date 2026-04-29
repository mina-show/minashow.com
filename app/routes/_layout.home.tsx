import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Package,
  PartyPopper,
  Mail,
  Phone,
  Music,
  Copy,
  PhoneCall,
  Check,
} from "lucide-react";
import { categories } from "~/lib/data/products";
import { ImageWithFallback } from "~/components/misc/image-with-fallback";

const PHONE_NUMBER = "1234567890";

export function meta() {
  return [
    { title: "Minashow — Kids Show Materials" },
    {
      name: "description",
      content: "Mascots, costumes, and soundtracks for communities everywhere.",
    },
  ];
}

export default function HomePage() {
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const phoneRef = useRef<HTMLDivElement>(null);

  /** Close popover on outside click */
  useEffect(() => {
    if (!phoneOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (phoneRef.current && !phoneRef.current.contains(e.target as Node)) {
        setPhoneOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [phoneOpen]);

  function handleCopy() {
    navigator.clipboard.writeText(PHONE_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /** Category map — keeps lookups explicit so each showcase card can own its layout. */
  const mascots = categories.find((c) => c.id === "mascots")!;
  const costumes = categories.find((c) => c.id === "costumes")!;
  const soundtracks = categories.find((c) => c.id === "soundtracks")!;

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative min-h-[75vh] flex flex-col justify-center overflow-hidden bg-brand-blue">
        <div className="absolute inset-0 opacity-20 bg-dot-lg" />

        {/* Tricolor baseline stripe — sits just above the curved divider */}
        <div className="absolute bottom-15 left-0 right-0 h-1.5 flex">
          <div className="flex-1 bg-brand-red" />
          <div className="flex-1 bg-brand-yellow" />
          <div className="flex-1 bg-brand-green" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pb-20 pt-0 text-center">
          <span className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-blue-100 text-xs font-sans font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-yellow" />
            Kids show essentials
          </span>
          <h1 className="text-white mb-6 font-display text-[clamp(2.5rem,5vw,4.25rem)] font-bold leading-[1.05]">
            Bring the show
            <br />
            <span className="relative inline-block">
              to life
              <span className="absolute -bottom-1 left-0 right-0 h-2 bg-brand-yellow/80 z-0" />
            </span>
          </h1>
          <p className="mb-8 max-w-xl mx-auto font-sans text-[1.1rem] leading-[1.7] text-blue-100">
            Everything you need for a great kids' show — mascots, costumes, and
            soundtracks. Made for communities everywhere that care about quality.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-white text-brand-blue px-6 py-3 rounded-full hover:bg-secondary transition-colors font-sans font-extrabold"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse the shop
            </Link>
            <Link
              to="/shop/soundtracks"
              className="inline-flex items-center gap-2 bg-transparent text-white border border-white/40 px-6 py-3 rounded-full hover:bg-white/10 transition-colors font-sans font-extrabold"
            >
              <Music className="w-4 h-4" />
              Listen to soundtracks
            </Link>
          </div>
        </div>

        {/* Curved divider into the next section */}
        <div className="absolute -bottom-px left-0 right-0">
          <svg
            className="block w-full h-auto"
            viewBox="0 0 1440 60"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 60V20C360 60 1080 0 1440 20V60H0Z" fill="#F9FAFB" />
          </svg>
        </div>
      </section>

      {/* ── The Lineup (asymmetric category showcase) ───────── */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 mb-3 text-brand-red font-sans font-extrabold text-xs uppercase tracking-[0.2em]">
                <span className="w-8 h-px bg-brand-red" />
                The lineup
              </div>
              <h2 className="text-gray-900 font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05]">
                Everything your
                <br />
                show needs.
              </h2>
            </div>
            <p className="max-w-sm text-gray-500 font-sans leading-[1.6]">
              Three kits, dozens of characters, endless performances. Pick a category and
              start building your production.
            </p>
          </div>

          {/* 12-col asymmetric grid — mascots tall on the left, costumes + soundtracks stacked on the right.
              Colors match the shop page packages: mascots=red (#aa1324), costumes=green (#6a9e0f), soundtracks=yellow (#fbf204).
              Local product imagery from /public/packages — no stock photos. */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
            {/* Mascots — hero tile (red) */}
            <Link
              to={`/shop/${mascots.id}`}
              className="group relative lg:col-span-7 lg:row-span-2 rounded-3xl overflow-hidden min-h-112 card-lift"
              style={{ backgroundColor: "#aa1324" }}
            >
              <ImageWithFallback
                src="/packages/human-mascots/mascot-1.jpeg"
                alt={mascots.name}
                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(170,19,36,0.95) 0%, rgba(170,19,36,0.4) 50%, transparent 100%)",
                }}
              />
              <div className="absolute top-6 left-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-display font-extrabold text-brand-blue">
                  01
                </span>
                <span className="text-white/80 font-sans text-xs uppercase tracking-[0.2em] font-bold">
                  Featured
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-white mb-2 font-display text-[2.25rem] font-bold leading-[1.05]">
                  {mascots.name}
                </h3>
                <p className="text-white/80 font-sans mb-5 max-w-md">{mascots.description}</p>
                <span className="inline-flex items-center gap-2 text-brand-yellow font-sans font-extrabold group-hover:gap-3 transition-all">
                  Explore mascots <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            {/* Costumes (green) */}
            <Link
              to={`/shop/${costumes.id}`}
              className="group relative lg:col-span-5 rounded-3xl overflow-hidden min-h-52 card-lift"
              style={{ backgroundColor: "#6a9e0f" }}
            >
              <div className="grid grid-cols-5 h-full">
                <div className="col-span-3 p-6 flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center font-display font-extrabold text-sm">
                      02
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white mb-1 font-display text-[1.5rem] font-bold leading-tight">
                      {costumes.name}
                    </h3>
                    <p className="text-white/80 font-sans text-sm mb-3 line-clamp-2">
                      {costumes.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-brand-yellow font-sans font-extrabold text-sm group-hover:gap-2 transition-all">
                      Explore <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <div className="col-span-2 relative">
                  <ImageWithFallback
                    src="/packages/human-costumes/costume1.jpeg"
                    alt={costumes.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </Link>

            {/* Soundtracks (yellow) — no local image, use a brand-styled music composition */}
            <Link
              to={`/shop/${soundtracks.id}`}
              className="group relative lg:col-span-5 rounded-3xl overflow-hidden min-h-52 card-lift"
              style={{ backgroundColor: "#fbf204" }}
            >
              <div className="absolute inset-0 bg-dot-sm opacity-20" />
              <div className="relative grid grid-cols-5 h-full">
                <div className="col-span-3 p-6 flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-display font-extrabold text-sm">
                      03
                    </span>
                  </div>
                  <div>
                    <h3 className="text-brand-blue mb-1 font-display text-[1.5rem] font-bold leading-tight">
                      {soundtracks.name}
                    </h3>
                    <p className="text-brand-blue/70 font-sans text-sm mb-3 line-clamp-2">
                      {soundtracks.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-brand-red font-sans font-extrabold text-sm group-hover:gap-2 transition-all">
                      Explore <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <div className="col-span-2 relative flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-brand-blue flex items-center justify-center -rotate-6 shadow-lg">
                    <Music className="w-10 h-10 text-brand-yellow" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="relative py-24 bg-brand-green-tint overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08] bg-dot-lg" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-3 text-brand-red font-sans font-extrabold text-xs uppercase tracking-[0.2em]">
              <span className="w-8 h-px bg-brand-red" />
              How it works
              <span className="w-8 h-px bg-brand-red" />
            </div>
            <h2 className="text-gray-900 font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05]">
              Three steps to showtime.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
            {[
              {
                num: "01",
                title: "Pick your show",
                desc: "Browse mascots, costumes, and soundtracks. Mix and match to fit your story.",
                Icon: Sparkles,
                bg: "bg-brand-red",
                fg: "text-white",
              },
              {
                num: "02",
                title: "Get your kit",
                desc: "We ship fast so you can rehearse with the real thing — no last-minute surprises.",
                Icon: Package,
                bg: "bg-brand-yellow",
                fg: "text-brand-blue",
              },
              {
                num: "03",
                title: "Hit the stage",
                desc: "Press play, cue the cast, and let the kids steal the spotlight.",
                Icon: PartyPopper,
                bg: "bg-brand-blue",
                fg: "text-white",
              },
            ].map(({ num, title, desc, Icon, bg, fg }) => (
              <div
                key={num}
                className="relative bg-white rounded-3xl p-7 shadow-sm border border-gray-100 card-lift"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${bg} ${fg} flex items-center justify-center mb-5 rotate-[-4deg]`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <div className="font-display font-extrabold text-gray-300 text-sm mb-1 tracking-widest">
                  STEP {num}
                </div>
                <h3 className="text-gray-900 mb-2 font-display text-[1.4rem] font-bold">
                  {title}
                </h3>
                <p className="text-gray-500 font-sans leading-[1.6]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Get in touch ────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 mb-3 text-brand-red font-sans font-extrabold text-xs uppercase tracking-[0.2em]">
            <span className="w-8 h-px bg-brand-red" />
            Get in touch
            <span className="w-8 h-px bg-brand-red" />
          </div>
          <h2 className="text-gray-900 mb-5 font-display text-[clamp(2rem,4vw,2.75rem)] font-bold leading-[1.05]">
            Planning something special?
          </h2>
          <p className="text-gray-500 font-sans leading-[1.7] mb-8 max-w-xl mx-auto">
            Questions about a show, need a custom kit, or want help picking the right
            package? We'd love to hear what you're putting together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            {/* Email — links to contact form */}
            <Link
              to="/contact"
              className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 flex-1 hover:border-brand-orange/30 hover:bg-brand-orange/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-orange/15 text-brand-orange flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-display font-extrabold text-gray-900 text-sm">Email us</div>
                <div className="font-sans text-xs text-gray-500">Send us a message</div>
              </div>
            </Link>

            {/* Phone — popover with call / copy options */}
            <div className="relative flex-1" ref={phoneRef}>
              <button
                type="button"
                onClick={() => setPhoneOpen((prev) => !prev)}
                className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 w-full hover:border-brand-green/30 hover:bg-brand-green-tint/30 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-green-tint text-brand-blue flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-display font-extrabold text-gray-900 text-sm">Call us</div>
                  <div className="font-sans text-xs text-gray-500">Anytime – leave a voicemail if we miss you</div>
                </div>
              </button>

              {phoneOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-10 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  <a
                    href={`tel:${PHONE_NUMBER}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <PhoneCall className="w-4 h-4 text-brand-blue" />
                    <span className="font-sans text-sm font-semibold text-gray-900">Call now</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-brand-blue" />
                    )}
                    <span className="font-sans text-sm font-semibold text-gray-900">
                      {copied ? "Copied!" : "Copy number"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────── */}
      <section className="relative py-20 bg-brand-blue overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-dot-lg" />
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="flex-1 bg-brand-red" />
          <div className="flex-1 bg-brand-yellow" />
          <div className="flex-1 bg-brand-green" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-white mb-4 font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05]">
            Ready to put on a show?
          </h2>
          <p className="text-blue-100 font-sans text-lg mb-8 max-w-xl mx-auto">
            Grab a kit, press play, and watch the kids light up the stage.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-white text-brand-blue px-6 py-3 rounded-full hover:bg-secondary transition-colors font-sans font-extrabold"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse the shop
            </Link>
            {/* <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-transparent text-white border border-white/40 px-6 py-3 rounded-full hover:bg-white/10 transition-colors font-sans font-extrabold"
            >
              Get in touch
            </Link> */}
          </div>
        </div>
      </section>
    </div>
  );
}
