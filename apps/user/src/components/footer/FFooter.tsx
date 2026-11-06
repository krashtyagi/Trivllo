"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import trivlloData from "@/../trivllo.json";

const wordmarkVariants: Variants = {
  hidden: { opacity: 0, y: 35, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
};
import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  BedDouble,
  Compass,
  Building2,
  ShieldCheck,
  Headphones,
  Heart,
  Tag,
  Mail,
  Star,
  User,
} from "lucide-react";

const partnerUrl =
  process.env.NEXT_PUBLIC_PARTNER_URL || "https://partner.trivllo.com/login";

const hotels = [
  "Luxury Stays",
  "Budget Stays",
  "Homestays",
  "Resorts",
  "Villas & Apartments",
  "Near Me",
];

const tours = [
  "Adventure Tours",
  "Cultural Tours",
  "Nature & Wildlife",
  "Honeymoon Packages",
  "Group Tours",
  "Custom Packages",
];

const companyLinks = [
  { label: "About Us", href: "/about-us" },
  { label: "Careers", href: "/careers" },
  { label: "Partner With Us", href: partnerUrl, external: true },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact-us" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [openSection, setOpenSection] = useState<string | null>(null);

  function toggleSection(section: string) {
    setOpenSection((cur) => (cur === section ? null : section));
  }

  function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setNewsletterMessage(
      "Thank you! You've been subscribed for exclusive travel deals.",
    );
  }

  return (
    <footer className="relative z-20 isolate overflow-hidden bg-[#031c15] text-white">
      {/* Google fonts for handwriting and serif accents */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Playfair+Display:ital,wght@1,600;1,700&display=swap');
        .font-handwriting {
          font-family: 'Caveat', cursive;
        }
        .font-serif-italic {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
        }
      `}</style>

      {/* =========================================================================
          SECTION 1: HERO NEWSLETTER (RESPONSIVE ACROSS ALL SCREEN SIZES)
          ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-[#07281f] ">
        {/* Landscape Banner Container */}
        <div
          className="relative mx-auto w-full max-w-[1640px] overflow-hidden bg-cover bg-right lg:bg-center shadow-[0_25px_60px_rgba(0,0,0,0.4)] ring-1 ring-white/10"
          style={{
            backgroundImage: `url("/footer_bg.png")`,
            minHeight: "360px",
          }}
        >
          {/* Subtle natural vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/35 pointer-events-none" />

          {/* Top-Right Scenic Script Accent ("Better Trips Bigger Stories ♡") */}
          <div className="pointer-events-none absolute right-6 top-6 z-10 hidden text-right lg:block xl:right-14 xl:top-8">
            <p className="font-handwriting text-3xl font-bold tracking-wide text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.8)] sm:text-4xl -rotate-6">
              Better Trips
              <br />
              Bigger Stories <span className="text-rose-200">♡</span>
            </p>
          </div>

          {/* FLOATING ORGANIC CARD CONTAINER */}
          <div className="relative z-10 flex w-full min-w-0 min-h-[340px] sm:min-h-[360px] items-center p-3 sm:p-6 lg:p-8 xl:p-10">
            {/* MOBILE & TABLET (< lg): Floating fully rounded frosted cream card */}
            <div className="relative w-full min-w-0 rounded-[20px] sm:rounded-[28px] bg-[#faf8f0]/95 p-4 sm:p-7 text-[#092e23] shadow-[0_16px_36px_rgba(0,0,0,0.25)] backdrop-blur-md lg:hidden">
              <NewsletterCardContent
                email={email}
                setEmail={setEmail}
                newsletterMessage={newsletterMessage}
                setNewsletterMessage={setNewsletterMessage}
                handleNewsletterSubmit={handleNewsletterSubmit}
              />
            </div>

            {/* DESKTOP (lg+): Floating wider cream card with smooth S-Curve wave on the right */}
            <div className="relative hidden lg:flex w-[78%] xl:w-[74%] 2xl:w-[70%] items-center">
              {/* SVG Organic Shape with Floating Drop Shadow */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  filter: "drop-shadow(14px 6px 22px rgba(0,0,0,0.22))",
                }}
              >
                <svg
                  viewBox="0 0 1000 300"
                  preserveAspectRatio="none"
                  className="h-full w-full"
                >
                  <path
                    d="M 28,0 L 890,0 C 930,0 925,50 905,110 C 885,170 910,230 960,275 C 980,292 995,300 1000,300 L 28,300 C 12,300 0,288 0,272 L 0,28 C 0,12 12,0 28,0 Z"
                    fill="#faf8f0"
                  />
                </svg>
              </div>

              {/* Card Content inside floating curved shape - constrained safely within cream fill */}
              <div className="relative z-10 w-full max-w-[88%] pl-8 pr-4 py-7 xl:pl-11 xl:pr-6 xl:py-8">
                <NewsletterCardContent
                  email={email}
                  setEmail={setEmail}
                  newsletterMessage={newsletterMessage}
                  setNewsletterMessage={setNewsletterMessage}
                  handleNewsletterSubmit={handleNewsletterSubmit}
                />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            LAYERED MOUNTAIN HORIZON / WAVE SILHOUETTE TRANSITION
            ========================================================================= */}
        <div className="relative -mt-22 sm:-mt-10 lg:-mt-25 w-full overflow-hidden leading-none z-20">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="w-full h-14 sm:h-20 lg:h-28"
          >
            {/* Back layered hill silhouette */}
            <path
              d="M 0,70 C 260,20 480,95 760,45 C 1040,-5 1240,65 1440,30 L 1440,120 L 0,120 Z"
              fill="#06271e"
              opacity="0.85"
            />
            {/* Front main mountain ridge blending into footer background */}
            <path
              d="M 0,85 C 320,35 560,95 860,60 C 1140,25 1320,80 1440,55 L 1440,120 L 0,120 Z"
              fill="#031c15"
            />
          </svg>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: MAIN NAVIGATION GRID & PROMO CARD (PERFECTED FOR ALL SCREENS)
          ========================================================================= */}
      <div className="relative z-20 mx-auto max-w-[1640px] px-4 pt-4 pb-6 sm:px-6 lg:px-8 xl:px-12">
        {/* 12-Column Responsive System: Prevents Any Column From Squeezing or Truncating */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-4 xl:gap-8">
          {/* COLUMN 1: BRAND, SOCIALS, POLAROIDS & STATS (Span 3-4 cols) */}
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-3 flex flex-col justify-between min-w-0">
            <div>
              {/* Brand Logo with /logo.png */}
              <Link
                href="/"
                aria-label={`${trivlloData.company_name} Home`}
                className="inline-block group"
              >
                <img
                  src="/logo.png"
                  alt={trivlloData.company_name}
                  className="h-9 sm:h-11 w-auto object-contain brightness-0 invert drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition group-hover:scale-105"
                />
              </Link>

              {/* Sub-header */}
              <p className="mt-2.5 text-xs sm:text-sm font-semibold text-emerald-400">
                Book Hotels &amp; Tours in India
              </p>

              {/* Description */}
              <p className="mt-2 text-xs leading-relaxed text-slate-300/80 max-w-sm">
                Explore the world with {trivlloData.company_name}. Your trusted
                platform for hotels, tours, and experiences.
              </p>

              {/* Social Icon Pills */}
              <div className="mt-4 flex items-center gap-2">
                <SocialIconButton
                  href="https://www.instagram.com/trivllo"
                  label="Instagram"
                  icon={<Instagram className="h-3.5 w-3.5" />}
                />
                <SocialIconButton
                  href="https://www.facebook.com/profile.php?id=61590569073379"
                  label="Facebook"
                  icon={<Facebook className="h-3.5 w-3.5" />}
                />
                <SocialIconButton
                  href="https://twitter.com/trivllo"
                  label="X / Twitter"
                  icon={<Twitter className="h-3.5 w-3.5" />}
                />
                <SocialIconButton
                  href="https://www.youtube.com/"
                  label="YouTube"
                  icon={<Youtube className="h-3.5 w-3.5" />}
                />
                <SocialIconButton
                  href="https://www.linkedin.com/"
                  label="LinkedIn"
                  icon={<Linkedin className="h-3.5 w-3.5" />}
                />
              </div>

              {/* Handwritten "More Than Just Trips" with airplane path */}
              <div className="mt-6 relative">
                <div className="flex items-center gap-2">
                  <span className="font-handwriting text-xl sm:text-2xl font-bold text-white/90 leading-tight">
                    More
                    <br />
                    <span className="text-emerald-300 text-lg sm:text-xl">
                      Than Just Trips
                    </span>
                  </span>
                  <svg
                    className="h-7 w-20 text-emerald-400/80 -mt-2"
                    viewBox="0 0 100 36"
                    fill="none"
                  >
                    <path
                      d="M5 28 C 30 8, 60 32, 85 14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <path d="M85 14 L 95 10 L 90 20 Z" fill="currentColor" />
                  </svg>
                </div>

                {/* 3 Angled Travel Polaroid Photos */}
                <div className="mt-2.5 flex items-center justify-center lg:justify-start -space-x-2.5 sm:-space-x-3">
                  <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 -rotate-8 rounded-xl bg-white p-1 shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition duration-300 hover:rotate-0 hover:scale-110 hover:z-30">
                    <img
                      src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80"
                      alt="Snowy mountain peaks"
                      className="h-full w-full rounded-lg object-cover"
                    />
                  </div>
                  <div className="relative z-20 w-16 h-16 sm:w-20 sm:h-20 -rotate-2 rounded-xl bg-white p-1 shadow-[0_14px_30px_rgba(0,0,0,0.4)] transition duration-300 hover:rotate-0 hover:scale-110 hover:z-30">
                    <img
                      src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=300&q=80"
                      alt="Historic Indian temple"
                      className="h-full w-full rounded-lg object-cover"
                    />
                  </div>
                  <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rotate-8 rounded-xl bg-white p-1 shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition duration-300 hover:rotate-0 hover:scale-110 hover:z-30">
                    <img
                      src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=300&q=80"
                      alt="Serene backwaters boat"
                      className="h-full w-full rounded-lg object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Stats Counter Row */}
            <div className="mt-6 flex justify-center w-full items-center gap-3 sm:gap-5 border-t border-emerald-900/40 pt-4">
              <div>
                <div className="text-base sm:text-lg font-black text-white">
                  1M+
                </div>
                <div className="text-[10px] text-slate-400">
                  Happy Travelers
                </div>
              </div>
              <div className="h-6 w-[1px] bg-emerald-800/40" />
              <div>
                <div className="text-base sm:text-lg font-black text-white">
                  4.8/5
                </div>
                <div className="text-[10px] text-slate-400">Average Rating</div>
              </div>
              <div className="h-6 w-[1px] bg-emerald-800/40" />
              <div>
                <div className="text-base sm:text-lg font-black text-white">
                  500+
                </div>
                <div className="text-[10px] text-slate-400">Verified Stays</div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: HOTELS (Span 2-3 cols) */}
          <div className="sm:col-span-1 lg:col-span-2 xl:col-span-2 min-w-0">
            <div
              onClick={() => toggleSection("hotels")}
              className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-emerald-900/30 sm:border-none cursor-pointer sm:cursor-default"
            >
              <div className="flex items-center gap-2">
                <BedDouble className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-white whitespace-nowrap">
                  Hotels
                </h3>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href="/hotels"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 whitespace-nowrap rounded-full border border-emerald-400/20 bg-[#07362a] px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition hover:bg-emerald-700 hover:text-white"
                >
                  Best Stays <ArrowRight className="h-2.5 w-2.5" />
                </Link>
                <ChevronDown
                  className={`h-4 w-4 text-emerald-400 sm:hidden transition-transform duration-200 ${
                    openSection === "hotels" ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            <ul
              className={`mt-2.5 space-y-2 ${openSection === "hotels" ? "block" : "hidden sm:block"}`}
            >
              {hotels.map((item) => (
                <li key={item}>
                  <Link
                    href="/hotels"
                    className="group flex items-center justify-between text-xs sm:text-[13px] text-slate-300/90 transition hover:translate-x-1 hover:text-emerald-300 py-0.5"
                  >
                    <span className="truncate">{item}</span>
                    <ChevronRight className="h-3 w-3 text-emerald-600 shrink-0 transition group-hover:text-emerald-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: TOURS (Span 2-3 cols) */}
          <div className="sm:col-span-1 lg:col-span-2 xl:col-span-2 min-w-0">
            <div
              onClick={() => toggleSection("tours")}
              className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-emerald-900/30 sm:border-none cursor-pointer sm:cursor-default"
            >
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-white whitespace-nowrap">
                  Tours
                </h3>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href="/tours"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 whitespace-nowrap rounded-full border border-emerald-400/20 bg-[#07362a] px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition hover:bg-emerald-700 hover:text-white"
                >
                  Journeys <ArrowRight className="h-2.5 w-2.5" />
                </Link>
                <ChevronDown
                  className={`h-4 w-4 text-emerald-400 sm:hidden transition-transform duration-200 ${
                    openSection === "tours" ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            <ul
              className={`mt-2.5 space-y-2 ${openSection === "tours" ? "block" : "hidden sm:block"}`}
            >
              {tours.map((item) => (
                <li key={item}>
                  <Link
                    href="/tours"
                    className="group flex items-center justify-between text-xs sm:text-[13px] text-slate-300/90 transition hover:translate-x-1 hover:text-emerald-300 py-0.5"
                  >
                    <span className="truncate">{item}</span>
                    <ChevronRight className="h-3 w-3 text-emerald-600 shrink-0 transition group-hover:text-emerald-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: COMPANY (Span 2-3 cols) */}
          <div className="sm:col-span-1 lg:col-span-2 xl:col-span-2 min-w-0">
            <div
              onClick={() => toggleSection("company")}
              className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-emerald-900/30 sm:border-none cursor-pointer sm:cursor-default"
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-white whitespace-nowrap">
                  Company
                </h3>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href="/about-us"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 whitespace-nowrap rounded-full border border-emerald-400/20 bg-[#07362a] px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition hover:bg-emerald-700 hover:text-white"
                >
                  About Us <ArrowRight className="h-2.5 w-2.5" />
                </Link>
                <ChevronDown
                  className={`h-4 w-4 text-emerald-400 sm:hidden transition-transform duration-200 ${
                    openSection === "company" ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            <ul
              className={`mt-2.5 space-y-2 ${openSection === "company" ? "block" : "hidden sm:block"}`}
            >
              {companyLinks.map((item) => (
                <li key={item.label}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between text-xs sm:text-[13px] text-slate-300/90 transition hover:translate-x-1 hover:text-emerald-300 py-0.5"
                    >
                      <span className="truncate">{item.label}</span>
                      <ChevronRight className="h-3 w-3 text-emerald-600 shrink-0 transition group-hover:text-emerald-300" />
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="group flex items-center justify-between text-xs sm:text-[13px] text-slate-300/90 transition hover:translate-x-1 hover:text-emerald-300 py-0.5"
                    >
                      <span className="truncate">{item.label}</span>
                      <ChevronRight className="h-3 w-3 text-emerald-600 shrink-0 transition group-hover:text-emerald-300" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 5: FEATURED EXPERIENCE PROMO CARD (Span 3 cols at lg & xl) */}
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-3 min-w-0">
            <div className="relative min-h-[300px] sm:min-h-[330px] xl:min-h-[360px] overflow-hidden rounded-[22px] sm:rounded-[28px] border border-emerald-500/20 bg-[#05281f] p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)] flex flex-col justify-between">
              {/* Background Alpine Lake with Hiker */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
                style={{
                  backgroundImage: `url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1100&q=85")`,
                }}
              />
              {/* Vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#021812] via-[#021812]/75 to-[#021812]/25" />

              {/* Top pill badge */}
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#c2efd4] px-3.5 py-1 text-[11px] font-bold text-[#064e3b] shadow-md">
                  Featured Experience
                </span>
              </div>

              {/* Middle Content */}
              <div className="relative z-10 my-auto pt-4">
                <h4 className="font-serif-italic text-2xl sm:text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md">
                  Discover
                  <br />
                  The Unseen
                </h4>

                <p className="mt-2 text-xs leading-relaxed text-slate-200 max-w-[240px] drop-shadow-sm">
                  Hidden gems, offbeat destinations and unforgettable
                  experiences await you.
                </p>

                <Link
                  href="/tours"
                  className="mt-4 sm:mt-5 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-5 py-2 text-xs font-bold text-[#053828] shadow-[0_8px_20px_rgba(255,255,255,0.2)] transition hover:bg-emerald-50 hover:scale-105 active:scale-95"
                >
                  Explore Tours <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Bottom-Right Handwritten Script Accent */}
              <div className="relative z-10 self-end text-right">
                <p className="font-handwriting text-xl sm:text-2xl font-bold text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] -rotate-6">
                  Adventure <span className="text-emerald-300">⛰️</span>
                  <br />
                  Awaits <span className="text-emerald-200">✈</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 3: TRUST & ASSURANCE BENEFITS BAR (RESPONSIVE GRID)
            ========================================================================= */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 border-y border-emerald-800/40 py-5 sm:py-6">
          <TrustBenefit
            icon={<ShieldCheck className="h-5 w-5 text-emerald-400" />}
            title="Secure Payments"
            description="100% safe & encrypted"
          />
          <TrustBenefit
            icon={<Tag className="h-5 w-5 text-emerald-400" />}
            title="Best Price Guarantee"
            description="Get the lowest prices, always"
          />
          <TrustBenefit
            icon={<ShieldCheck className="h-5 w-5 text-emerald-400" />}
            title="Verified Properties"
            description="Only trusted & verified stays"
          />
          <TrustBenefit
            icon={<Headphones className="h-5 w-5 text-emerald-400" />}
            title="24/7 Support"
            description="We're here, always"
          />
          <TrustBenefit
            icon={<Heart className="h-5 w-5 text-emerald-400" />}
            title="Trusted Platform"
            description="Millions of happy travelers"
          />
        </div>

        {/* =========================================================================
            SECTION 4: COPYRIGHT, LEGAL LINKS & APP STORE BADGES
            ========================================================================= */}
        <div className="relative flex flex-col items-center justify-between gap-5 py-6 sm:py-8 md:flex-row">
          {/* Subtle background script in center */}
          <div className="pointer-events-none absolute inset-x-0 -top-3 flex justify-center opacity-30">
            <span className="font-handwriting text-2xl sm:text-3xl font-bold tracking-wider text-emerald-300/40 -rotate-3">
              Same Planet, Different Stories ♡
            </span>
          </div>

          {/* Left: Brand logo & copyright */}
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-400">
            <img
              src="/logo.png"
              alt={trivlloData.company_name}
              className="h-6 w-auto object-contain brightness-0 invert opacity-80"
            />
            <span>
              &copy; {new Date().getFullYear()} {trivlloData.company_name}. All
              Rights Reserved
            </span>
          </div>

          {/* Right: Legal links & Official App Store Badges */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-300">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <Link
                href="/terms-of-services"
                className="transition hover:text-emerald-300"
              >
                Terms &amp; Conditions
              </Link>
              <span className="text-white/20">|</span>
              <Link
                href="/privacy-policy"
                className="transition hover:text-emerald-300"
              >
                Privacy Policy
              </Link>
              <span className="text-white/20">|</span>
              <Link
                href="/about-us"
                className="transition hover:text-emerald-300"
              >
                About Us
              </Link>
              <span className="text-white/20">|</span>
              <a
                href={partnerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-emerald-300"
              >
                Partner With Us
              </a>
            </div>

            {/* Official App Store Download Badges */}
            {/* <div className="flex items-center gap-2">
              <a
                href="#"
                aria-label="Download on the App Store"
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/50 px-2.5 py-1.5 shadow-sm transition hover:bg-black/80 hover:border-white/30"
              >
                <svg
                  className="h-4 w-4 fill-white shrink-0"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.07 1.72-.94 2.74 1 .08 2.03-.51 2.65-1.24" />
                </svg>
                <div className="text-left leading-none">
                  <div className="text-[7px] uppercase tracking-wider text-slate-300">
                    Download on the
                  </div>
                  <div className="text-[10px] font-bold text-white">
                    App Store
                  </div>
                </div>
              </a>

              <a
                href="#"
                aria-label="Get it on Google Play"
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/50 px-2.5 py-1.5 shadow-sm transition hover:bg-black/80 hover:border-white/30"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M3.609 1.814L13.792 12 3.61 22.186c-.33-.368-.53-.87-.53-1.446V3.26c0-.576.2-1.078.53-1.446z"
                    fill="#2196F3"
                  />
                  <path
                    d="M17.156 8.636l-3.364 3.364 3.364 3.364 3.796-2.156c1.082-.614 1.082-1.616 0-2.23l-3.796-2.342z"
                    fill="#FFC107"
                  />
                  <path
                    d="M3.609 1.814l10.183 10.186 3.364-3.364L6.12.757C4.945.09 3.992.518 3.609 1.814z"
                    fill="#4CAF50"
                  />
                  <path
                    d="M3.609 22.186c.383 1.296 1.336 1.724 2.511 1.057l11.036-6.265-3.364-3.364L3.609 22.186z"
                    fill="#F44336"
                  />
                </svg>
                <div className="text-left leading-none">
                  <div className="text-[7px] uppercase tracking-wider text-slate-300">
                    GET IT ON
                  </div>
                  <div className="text-[10px] font-bold text-white">
                    Google Play
                  </div>
                </div>
              </a>
            </div> */}
          </div>
        </div>
      </div>
      {/* =========================================================================
          WATERMELON UI (FOOTER-16) GIANT "TRIVLLO" BACKGROUND WORDMARK
          ========================================================================= */}
      <motion.div
        variants={wordmarkVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="pointer-events-none absolute bottom-0 left-1/2 z-0 flex w-[125vw] -translate-x-1/2 justify-center overflow-hidden select-none"
        aria-hidden="true"
      >
        <svg
          className="h-auto w-full select-none"
          viewBox="0 0 700 135"
          preserveAspectRatio="xMidYMid meet"
          aria-label="TRIVLLO"
        >
          <defs>
            <linearGradient
              id="trivlloWordmarkGrad"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
              <stop offset="50%" stopColor="#34d399" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#031c15" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <text
            x="50%"
            y="76%"
            dominantBaseline="alphabetic"
            textAnchor="middle"
            textLength="90%"
            lengthAdjust="spacing"
            className="font-sans font-black tracking-tight uppercase"
            fill="url(#trivlloWordmarkGrad)"
            fontSize="125"
          >
            TRIVLLO
          </text>
        </svg>
      </motion.div>
    </footer>
  );
}

function NewsletterCardContent({
  email,
  setEmail,
  newsletterMessage,
  setNewsletterMessage,
  handleNewsletterSubmit,
}: {
  email: string;
  setEmail: (val: string) => void;
  newsletterMessage: string;
  setNewsletterMessage: (val: string) => void;
  handleNewsletterSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <>
      {/* Script Header with dashed trail & tiny airplane */}
      <div className="mb-1 flex items-center gap-1.5 sm:mb-1.5 sm:gap-2">
        <span className="font-handwriting text-xl font-bold text-[#115e45] sm:text-[28px]">
          Let&apos;s Stay in Touch
        </span>
        <svg
          className="h-5 w-12 sm:h-6 sm:w-16 text-[#115e45] shrink-0"
          viewBox="0 0 70 24"
          fill="none"
        >
          <path
            d="M2 18 C 20 6, 40 22, 58 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <path d="M58 8 L 66 6 L 62 14 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="grid w-full min-w-0 gap-3.5 sm:gap-5 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-6 xl:gap-10">
        {/* Left: Heading & Description */}
        <div className="w-full min-w-0">
          <div className="relative pl-2.5 sm:pl-3">
            <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-[#0a523c]" />
            <h2 className="text-lg font-black leading-snug tracking-tight text-[#072d22] sm:text-2xl lg:text-[25px]">
              Get the best travel deals,
              <br className="hidden sm:inline" /> insider tips &amp; more.
            </h2>
          </div>

          <p className="mt-1.5 sm:mt-2 text-xs leading-relaxed text-slate-600 sm:text-[13px] max-w-sm">
            Be the first to know about special offers, new destinations, travel
            tips and exclusive {trivlloData.company_name} experiences.
          </p>
        </div>

        {/* Right: Email Input Pill & 4 Value Badges */}
        <div className="w-full max-w-[400px] min-w-0">
          <form
            onSubmit={handleNewsletterSubmit}
            className="flex w-full min-w-0 items-center rounded-full border border-slate-200/90 bg-white p-1 sm:p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] transition focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20"
          >
            <Mail className="ml-2.5 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setNewsletterMessage("");
              }}
              placeholder="Enter your email address"
              aria-label="Email address"
              className="min-w-0 flex-1 bg-transparent px-2 sm:px-3 py-1 sm:py-1.5 text-xs text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm"
            />
            <button
              type="submit"
              aria-label="Submit newsletter"
              className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#063f2f] text-white shadow-[0_4px_12px_rgba(6,63,47,0.3)] transition hover:bg-emerald-800 hover:scale-105 active:scale-95"
            >
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </form>

          {newsletterMessage && (
            <p className="mt-2 text-xs font-semibold text-emerald-800">
              {newsletterMessage}
            </p>
          )}

          {/* 4 Feature Badges below Input */}
          <div className="mt-3 sm:mt-3.5 grid grid-cols-2 gap-x-2 gap-y-2 sm:flex sm:flex-wrap sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-medium text-slate-700 min-w-0">
              <Tag className="h-3.5 w-3.5 shrink-0 text-[#0a523c]" />
              <span className="truncate">Exclusive Deals</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-medium text-slate-700 min-w-0">
              <User className="h-3.5 w-3.5 shrink-0 text-[#0a523c]" />
              <span className="truncate">Travel Inspiration</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-medium text-slate-700 min-w-0">
              <Star className="h-3.5 w-3.5 shrink-0 text-[#0a523c]" />
              <span className="truncate">Early Access</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-medium text-slate-700 min-w-0">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#0a523c]" />
              <span className="truncate">No Spam Promise</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SocialIconButton({
  icon,
  href,
  label,
}: {
  icon: React.ReactNode;
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-emerald-500/20 bg-[#07362a] text-emerald-300 shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:bg-emerald-600 hover:text-white hover:shadow-[0_6px_20px_rgba(16,185,129,0.3)]"
    >
      {icon}
    </a>
  );
}

function TrustBenefit({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-2.5 sm:gap-3 rounded-2xl  p-2.5 sm:p-3 shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition hover:bg-white/[0.05] hover:border-emerald-500/20">
      <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
        {icon}
      </div>
      <div className="min-w-0">
        <h4 className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
          {title}
        </h4>
        <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-400 leading-tight truncate">
          {description}
        </p>
      </div>
    </div>
  );
}

function TravelPhotoStack() {
  const [isExpanded, setIsExpanded] = useState(false);

  const photos = [
    {
      src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80",
      alt: "Snowy mountain peaks",
      rotation: "-rotate-8",
    },
    {
      src: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=300&q=80",
      alt: "Historic Indian temple",
      rotation: "-rotate-2",
    },
    {
      src: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=300&q=80",
      alt: "Serene backwaters boat",
      rotation: "rotate-8",
    },
  ];

  return (
    <div
      onClick={() => setIsExpanded((prev) => !prev)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setIsExpanded((prev) => !prev);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={
        isExpanded ? "Collapse travel photos" : "Expand travel photos"
      }
      aria-expanded={isExpanded}
      className={`group mt-2.5 flex w-fit max-w-full items-center justify-center lg:justify-start
        ${isExpanded ? "is-expanded" : ""}
        cursor-pointer`}
    >
      {photos.map((photo, index) => (
        <div
          key={photo.alt}
          className={`relative h-16 w-16 shrink-0 rounded-xl bg-white p-1
            shadow-[0_10px_24px_rgba(0,0,0,0.35)]
            transition-all duration-500 ease-out
            sm:h-20 sm:w-20
            ${photo.rotation}
            ${index === 1 ? "z-20" : "z-10"}
            group-hover:mx-1.5 group-hover:rotate-0 group-hover:scale-105
            group-hover:z-30
            group-[.is-expanded]:mx-1.5
            group-[.is-expanded]:rotate-0
            group-[.is-expanded]:z-30
            group-[.is-expanded]:scale-105
            ${index === 0 ? "-ml-0" : "-ml-2.5 sm:-ml-3"}
          `}
        >
          <img
            src={photo.src}
            alt={photo.alt}
            loading="lazy"
            className="h-full w-full rounded-lg object-cover"
          />
        </div>
      ))}
    </div>
  );
}
