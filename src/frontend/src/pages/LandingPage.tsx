import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CloudRain,
  Loader2,
  MessageSquare,
  ShoppingBag,
  ShoppingCart,
  Sprout,
  Star,
  Tractor,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { motion } from "motion/react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyProfile } from "../hooks/useQueries";

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Sprout,
    title: "Smart Crop Guidance",
    description:
      "Get AI-powered recommendations for crops, fertilizers, and disease detection tailored to your soil and season.",
    badge: "AI Powered",
    gradient: "from-emerald-50 to-green-100",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: ShoppingCart,
    title: "Crop Marketplace",
    description:
      "Sell your harvest directly to buyers — no middlemen, better prices, more profit for your family.",
    badge: "Direct Sales",
    gradient: "from-amber-50 to-yellow-100",
    iconBg: "bg-accent/20",
    iconColor: "text-amber-700",
  },
  {
    icon: Tractor,
    title: "Equipment Rental",
    description:
      "Rent tractors, harvesters, and seeders from nearby farmers at affordable daily or hourly rates.",
    badge: "Save Money",
    gradient: "from-sky-50 to-blue-100",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-700",
  },
  {
    icon: CloudRain,
    title: "Weather Alerts",
    description:
      "Receive timely alerts for storms, frost, and heatwaves so you can protect your crops before damage occurs.",
    badge: "Stay Safe",
    gradient: "from-indigo-50 to-violet-100",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-700",
  },
  {
    icon: BookOpen,
    title: "Government Schemes",
    description:
      "Discover PM-KISAN, crop insurance, subsidies, and loan programs available to farmers in your state.",
    badge: "Free Benefits",
    gradient: "from-rose-50 to-pink-100",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-700",
  },
  {
    icon: MessageSquare,
    title: "Direct Messaging",
    description:
      "Chat directly with buyers, equipment owners, and sellers to negotiate deals without phone calls.",
    badge: "Connect",
    gradient: "from-teal-50 to-cyan-100",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-700",
  },
];

const stats = [
  { value: "10,000+", label: "Farmers Registered", emoji: "👨\u200d🌾" },
  { value: "₹2.4Cr", label: "Crops Sold", emoji: "💰" },
  { value: "500+", label: "Equipment Listings", emoji: "🚜" },
  { value: "28", label: "States Covered", emoji: "🗺️" },
];

const trustBadges = [
  "🌾 PM-KISAN Partner",
  "✅ 10,000+ Farmers",
  "🗺️ 28 States",
  "💰 ₹2.4Cr Sold",
  "🏅 ISO Certified",
  "🏛️ Govt. Approved",
  "📱 Mobile Friendly",
  "🔒 Secure Platform",
  "🌱 Eco Certified",
  "⭐ 4.9 Star Rated",
];

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Register Free",
    description:
      "Create your farmer profile in 2 minutes. Add your land details, crops, and location.",
  },
  {
    icon: ShoppingBag,
    step: "02",
    title: "List or Browse",
    description:
      "Post your crops for sale, browse equipment rentals, or explore government schemes near you.",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Grow Your Income",
    description:
      "Connect directly with buyers, get AI advice, and maximize profits from every harvest.",
  },
];

const testimonials = [
  {
    image: "/assets/generated/farmer-testimonial-1.dim_400x400.jpg",
    name: "Ramesh Kumar",
    location: "Punjab",
    quote:
      "Maine pichle season mein apni gehun ki fasal seedha buyers ko bech di. Koi dalaal nahi, seedha ₹18,000 zyada mila! Yeh platform meri zindagi badal diya.",
    rating: 5,
  },
  {
    image: "/assets/generated/farmer-testimonial-2.dim_400x400.jpg",
    name: "Sunita Devi",
    location: "Maharashtra",
    quote:
      "Government schemes section ne mujhe PM-KISAN aur crop insurance ke baare mein bataya jo mujhe nahi pata tha. Ab mujhe ₹6,000 per year milta hai. Bahut helpful platform!",
    rating: 5,
  },
];

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: profile } = useMyProfile();

  const handleGetStarted = () => {
    if (identity && profile) {
      window.location.href = "/dashboard";
    } else if (identity && !profile) {
      window.location.href = "/register";
    } else {
      login();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col justify-end overflow-hidden">
        {/* Full-bleed background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-farmland-premium.dim_1600x800.jpg')",
          }}
          aria-hidden="true"
        />

        {/* Deep gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(175deg, oklch(0.20 0.10 148 / 0.88) 0%, oklch(0.25 0.10 148 / 0.80) 40%, oklch(0.15 0.06 148 / 0.95) 100%)",
          }}
          aria-hidden="true"
        />

        {/* Grain texture */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E\")",
          }}
          aria-hidden="true"
        />

        {/* Hero content */}
        <div className="relative z-10 container pb-32 pt-24 md:pt-32">
          {/* Animated pill badge */}
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6 inline-flex"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-body font-semibold text-white/90 tracking-wide">
              <span className="text-base">🌾</span>
              India's #1 Smart Farming Platform
              <span className="ml-1 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
                NEW
              </span>
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeOut", delay: 0.15 }}
          >
            <h1 className="font-fraunces font-black leading-[1.05] text-white text-balance">
              <span className="block text-5xl md:text-7xl lg:text-8xl">
                Grow More.
              </span>
              <span className="block text-5xl md:text-7xl lg:text-8xl mt-1">
                Earn More.
              </span>
              <span className="block text-5xl md:text-7xl lg:text-8xl mt-1 golden-text">
                Farm Smarter.
              </span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
            className="mt-6 font-body text-lg md:text-xl text-white/75 max-w-2xl leading-relaxed"
          >
            AI-powered tools for India's 100 million farmers — sell crops, rent
            equipment, get expert advice and access government benefits.
          </motion.p>

          {/* Checkmarks */}
          <motion.ul
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.45 }}
            className="mt-5 flex flex-wrap gap-4 font-body text-sm text-white/80"
          >
            {[
              "Sell crops without middlemen",
              "AI disease detection",
              "Rent equipment affordably",
            ].map((point) => (
              <li key={point} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                {point}
              </li>
            ))}
          </motion.ul>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.55 }}
            className="mt-9 flex flex-col sm:flex-row gap-3"
          >
            <Button
              size="lg"
              onClick={handleGetStarted}
              disabled={isLoggingIn}
              className="font-body font-bold text-base h-13 px-8 bg-accent text-accent-foreground hover:bg-accent/90 border-0 shadow-lg shadow-black/30"
              data-ocid="landing.primary_button"
            >
              {isLoggingIn ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isLoggingIn
                ? "Connecting..."
                : identity
                  ? "Go to Dashboard"
                  : "Get Started Free"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {!identity && (
              <Button
                size="lg"
                variant="outline"
                onClick={login}
                disabled={isLoggingIn}
                className="font-body font-semibold text-base h-13 px-8 border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent backdrop-blur-sm"
                data-ocid="landing.secondary_button"
              >
                Watch Demo
                <span className="ml-2">▶</span>
              </Button>
            )}
          </motion.div>
        </div>

        {/* Floating stats band — overlaps hero bottom */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.7 }}
          className="relative z-20 container"
        >
          <div className="absolute left-4 right-4 md:left-0 md:right-0 bottom-0 translate-y-1/2 rounded-2xl bg-white shadow-stats border border-border/40 py-6 px-4 md:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/60">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center px-4">
                  <div className="text-2xl mb-1">{stat.emoji}</div>
                  <p className="font-fraunces text-2xl md:text-3xl font-black text-primary">
                    {stat.value}
                  </p>
                  <p className="font-body text-xs text-muted-foreground mt-0.5 leading-tight">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── TRUST MARQUEE ──────────────────────────────────────────────────── */}
      <section className="mt-24 overflow-hidden border-y border-border/50 bg-primary/5 py-4">
        <div className="marquee-track">
          {[...trustBadges, ...trustBadges].map((badge, idx) => (
            <div
              key={`${badge}-${idx < trustBadges.length ? "a" : "b"}`}
              className="mx-6 shrink-0 inline-flex items-center gap-2 font-body text-sm font-semibold text-foreground/70"
            >
              <span>{badge}</span>
              <span className="text-border mx-2">•</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section className="py-24" id="features">
        <div className="container">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge
              variant="outline"
              className="mb-4 font-body text-xs tracking-widest uppercase font-semibold border-primary/30 text-primary"
            >
              Everything You Need
            </Badge>
            <h2 className="font-fraunces text-4xl md:text-5xl font-black text-foreground text-balance">
              One Platform for Every Farmer
            </h2>
            <p className="mt-4 font-body text-muted-foreground leading-relaxed text-base">
              From AI crop guidance to direct marketplace sales — tools that
              help India's farmers thrive in the digital age.
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {features.map((feat, idx) => (
              <motion.div
                key={feat.title}
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`group bg-gradient-to-br ${feat.gradient} border border-border/50 rounded-2xl p-7 hover:shadow-card-hover hover:border-primary/20 transition-all duration-300 cursor-default`}
                data-ocid={`features.item.${idx + 1}`}
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feat.iconBg} mb-5`}
                >
                  <feat.icon className={`h-6 w-6 ${feat.iconColor}`} />
                </div>
                <Badge
                  variant="secondary"
                  className="mb-3 font-body text-[10px] font-bold tracking-wider uppercase bg-white/60"
                >
                  {feat.badge}
                </Badge>
                <h3 className="font-fraunces text-xl font-bold text-foreground mb-2.5">
                  {feat.title}
                </h3>
                <p className="font-body text-sm text-foreground/65 leading-relaxed">
                  {feat.description}
                </p>
                <div className="mt-4 flex items-center gap-1 font-body text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="h-3 w-3" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section
        className="py-24 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.97 0.008 95) 0%, oklch(0.94 0.02 148) 100%)",
        }}
      >
        <div className="container">
          <motion.div
            className="text-center max-w-xl mx-auto mb-16"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge
              variant="outline"
              className="mb-4 font-body text-xs tracking-widest uppercase font-semibold border-primary/30 text-primary"
            >
              Simple Process
            </Badge>
            <h2 className="font-fraunces text-4xl md:text-5xl font-black text-foreground text-balance">
              Get Started in 3 Steps
            </h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8 md:gap-6 relative"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {/* Connecting dashed lines — desktop only */}
            <div
              className="hidden md:block absolute top-12 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-px"
              style={{
                borderTop: "2px dashed oklch(0.38 0.12 148 / 0.25)",
              }}
              aria-hidden="true"
            />

            {steps.map((step, idx) => (
              <motion.div
                key={step.step}
                variants={itemVariants}
                className="flex flex-col items-center text-center"
                data-ocid={`how_it_works.item.${idx + 1}`}
              >
                {/* Numbered circle */}
                <div className="relative mb-6">
                  <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <step.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-accent flex items-center justify-center">
                    <span className="font-fraunces text-xs font-black text-accent-foreground">
                      {idx + 1}
                    </span>
                  </div>
                </div>
                <h3 className="font-fraunces text-2xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="container">
          <motion.div
            className="text-center max-w-xl mx-auto mb-16"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge
              variant="outline"
              className="mb-4 font-body text-xs tracking-widest uppercase font-semibold border-primary/30 text-primary"
            >
              Farmer Stories
            </Badge>
            <h2 className="font-fraunces text-4xl md:text-5xl font-black text-foreground text-balance">
              Farmers Love Us
            </h2>
            <p className="mt-4 font-body text-muted-foreground">
              Real stories from real farmers across India.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.name}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-card border border-border/60 rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-all"
                data-ocid={`testimonials.item.${idx + 1}`}
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: t.rating }, (_, pos) => pos + 1).map(
                    (pos) => (
                      <Star
                        key={pos}
                        className="h-4 w-4 fill-accent text-accent"
                      />
                    ),
                  )}
                </div>

                {/* Quote */}
                <p className="font-body text-base text-foreground/80 leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-fraunces font-bold text-foreground text-base">
                      {t.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-body font-semibold text-primary">
                        📍 {t.location}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── BOTTOM CTA ─────────────────────────────────────────────────────── */}
      <section
        className="py-24 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.28 0.12 148) 0%, oklch(0.35 0.10 148) 50%, oklch(0.22 0.08 160) 100%)",
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-10"
          style={{ background: "oklch(0.78 0.14 78)" }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full opacity-10"
          style={{ background: "oklch(0.78 0.14 78)" }}
          aria-hidden="true"
        />

        <div className="container relative z-10">
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-5xl mb-5">🌾</div>
            <h2 className="font-fraunces text-4xl md:text-5xl font-black text-white text-balance">
              Start your smart farming journey today
            </h2>
            <p className="mt-5 font-body text-white/70 text-lg leading-relaxed">
              Join 10,000+ farmers already using Smart Farming AI Marketplace to
              increase their income and reduce losses.
            </p>
            <div className="mt-10">
              <Button
                size="lg"
                onClick={handleGetStarted}
                disabled={isLoggingIn}
                className="font-body font-bold text-base h-14 px-10 bg-accent text-accent-foreground hover:bg-accent/90 border-0 shadow-xl shadow-black/30"
                data-ocid="cta.primary_button"
              >
                {isLoggingIn ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {identity ? "Open Dashboard" : "Create Free Account"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="mt-4 font-body text-sm text-white/50">
                Free forever · No credit card required · 2 min setup
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
