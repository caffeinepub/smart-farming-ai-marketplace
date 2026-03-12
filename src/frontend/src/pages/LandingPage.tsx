import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CloudRain,
  Loader2,
  MessageSquare,
  ShoppingCart,
  Sprout,
  Tractor,
} from "lucide-react";
import { motion } from "motion/react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyProfile } from "../hooks/useQueries";

const features = [
  {
    icon: Sprout,
    title: "Smart Crop Guidance",
    description:
      "Get AI-powered recommendations for crops, fertilizers, and disease detection tailored to your soil and season.",
    badge: "AI Powered",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: ShoppingCart,
    title: "Crop Marketplace",
    description:
      "Sell your harvest directly to buyers — no middlemen, better prices, more profit for your family.",
    badge: "Direct Sales",
    color: "bg-accent/20 text-accent-foreground",
  },
  {
    icon: Tractor,
    title: "Equipment Rental",
    description:
      "Rent tractors, harvesters, and seeders from nearby farmers at affordable daily or hourly rates.",
    badge: "Save Money",
    color: "bg-secondary/60 text-secondary-foreground",
  },
  {
    icon: CloudRain,
    title: "Weather Alerts",
    description:
      "Receive timely alerts for storms, frost, and heatwaves so you can protect your crops before damage occurs.",
    badge: "Stay Safe",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: BookOpen,
    title: "Government Schemes",
    description:
      "Discover PM-KISAN, crop insurance, subsidies, and loan programs available to farmers in your state.",
    badge: "Free Benefits",
    color: "bg-accent/20 text-accent-foreground",
  },
  {
    icon: MessageSquare,
    title: "Direct Messaging",
    description:
      "Chat directly with buyers, equipment owners, and sellers to negotiate deals without phone calls.",
    badge: "Connect",
    color: "bg-secondary/60 text-secondary-foreground",
  },
];

const stats = [
  { value: "10,000+", label: "Farmers Registered" },
  { value: "₹2.4Cr", label: "Crops Sold" },
  { value: "500+", label: "Equipment Listings" },
  { value: "28", label: "States Covered" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

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

      {/* Hero */}
      <section className="relative overflow-hidden clip-hero grain-overlay bg-primary pb-24 pt-20 md:pt-28">
        {/* Farm image overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-farmland.dim_1400x700.jpg')",
          }}
          aria-hidden="true"
        />
        {/* Gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.28 0.10 148 / 0.95) 0%, oklch(0.38 0.12 148 / 0.80) 60%, oklch(0.45 0.08 155 / 0.70) 100%)",
          }}
          aria-hidden="true"
        />

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <Badge
              className="mb-6 border-accent/40 bg-accent/20 text-accent-foreground font-body font-semibold text-xs tracking-widest uppercase px-3 py-1"
              variant="outline"
            >
              🌾 India's Smart Agriculture Platform
            </Badge>

            <h1 className="font-display text-4xl font-black leading-[1.1] text-white md:text-6xl lg:text-7xl text-balance">
              Smart Farming
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.88 0.16 78), oklch(0.80 0.12 90))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                AI Marketplace
              </span>
            </h1>

            <p className="mt-6 font-body text-lg text-white/80 max-w-xl leading-relaxed">
              Empowering India's farmers with AI guidance, direct crop sales,
              equipment rental, and government scheme access — all in one
              platform.
            </p>

            <ul className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-6 font-body text-sm text-white/75">
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
            </ul>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={handleGetStarted}
                disabled={isLoggingIn}
                className="font-body font-bold text-base bg-accent text-accent-foreground hover:bg-accent/90 border-0 shadow-lg"
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
                  className="font-body font-semibold text-base border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent"
                  data-ocid="landing.secondary_button"
                >
                  Login to Account
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-foreground/5 border-b border-border/60 py-6">
        <div className="container">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={item}
                className="text-center"
              >
                <p className="font-display text-2xl font-black text-primary">
                  {stat.value}
                </p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20" id="features">
        <div className="container">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-14"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge
              variant="outline"
              className="mb-4 font-body text-xs tracking-widest uppercase font-semibold"
            >
              Everything You Need
            </Badge>
            <h2 className="font-display text-3xl font-black text-foreground md:text-4xl text-balance">
              One Platform for Every Farmer
            </h2>
            <p className="mt-4 font-body text-muted-foreground leading-relaxed">
              From AI crop guidance to direct marketplace sales — we've built
              the tools that help Indian farmers thrive.
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {features.map((feat, idx) => (
              <motion.div
                key={feat.title}
                variants={item}
                className="group bg-card border border-border/60 rounded-xl p-6 hover:shadow-card hover:border-primary/30 transition-all duration-300 cursor-default"
                data-ocid={`features.item.${idx + 1}`}
              >
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ${feat.color} mb-4`}
                >
                  <feat.icon className="h-5 w-5" />
                </div>
                <Badge
                  variant="secondary"
                  className="mb-3 font-body text-[10px] font-semibold tracking-wider uppercase"
                >
                  {feat.badge}
                </Badge>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  {feat.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary/5 border-y border-border/60">
        <div className="container">
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-3xl font-black text-foreground md:text-4xl text-balance">
              Ready to transform your farming?
            </h2>
            <p className="mt-4 font-body text-muted-foreground leading-relaxed">
              Join thousands of farmers already using Smart Farming AI
              Marketplace to increase their income and reduce losses.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={handleGetStarted}
                disabled={isLoggingIn}
                className="font-body font-bold text-base"
                data-ocid="cta.primary_button"
              >
                {isLoggingIn ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {identity ? "Open Dashboard" : "Create Free Account"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
