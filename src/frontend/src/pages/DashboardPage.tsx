import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Clock,
  CloudRain,
  MessageSquare,
  ShoppingCart,
  Sprout,
  Store,
  Tractor,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useMyProfile } from "../hooks/useQueries";

const modules = [
  {
    icon: Sprout,
    title: "Crop Guidance",
    description:
      "AI-powered crop recommendations, disease detection, and fertilizer advice.",
    status: "coming-soon",
    href: "#",
    color: "text-primary",
    bg: "bg-primary/10",
    badgeColor: "secondary",
  },
  {
    icon: ShoppingCart,
    title: "Crop Marketplace",
    description:
      "List your crops for direct sale. Remove middlemen, earn more.",
    status: "coming-soon",
    href: "#",
    color: "text-accent-foreground",
    bg: "bg-accent/20",
    badgeColor: "secondary",
  },
  {
    icon: Store,
    title: "Agriculture Store",
    description:
      "Buy seeds, fertilizers, pesticides, and tools from trusted vendors.",
    status: "coming-soon",
    href: "#",
    color: "text-primary",
    bg: "bg-primary/10",
    badgeColor: "secondary",
  },
  {
    icon: Tractor,
    title: "Equipment Rental",
    description: "Rent tractors, harvesters, and sprayers at affordable rates.",
    status: "coming-soon",
    href: "#",
    color: "text-accent-foreground",
    bg: "bg-accent/20",
    badgeColor: "secondary",
  },
  {
    icon: CloudRain,
    title: "Weather Alerts",
    description:
      "Get timely alerts for storms, frost, and heatwaves in your area.",
    status: "coming-soon",
    href: "#",
    color: "text-primary",
    bg: "bg-primary/10",
    badgeColor: "secondary",
  },
  {
    icon: BookOpen,
    title: "Government Schemes",
    description: "PM-KISAN, crop insurance, subsidies, and loan programs.",
    status: "coming-soon",
    href: "#",
    color: "text-accent-foreground",
    bg: "bg-accent/20",
    badgeColor: "secondary",
  },
  {
    icon: MessageSquare,
    title: "Messages",
    description: "Chat with buyers, sellers, and equipment owners directly.",
    status: "coming-soon",
    href: "#",
    color: "text-primary",
    bg: "bg-primary/10",
    badgeColor: "secondary",
  },
  {
    icon: User,
    title: "My Profile",
    description: "View and update your farmer profile and farm details.",
    status: "available",
    href: "/profile",
    color: "text-accent-foreground",
    bg: "bg-accent/20",
    badgeColor: "default",
  },
] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function DashboardPage() {
  const { data: profile, isLoading } = useMyProfile();

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "F";

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="container max-w-5xl">
          {/* Welcome header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 rounded-2xl bg-primary text-primary-foreground relative overflow-hidden">
              {/* Decorative circles */}
              <div
                aria-hidden="true"
                className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5"
              />
              <div
                aria-hidden="true"
                className="absolute -right-4 -bottom-8 h-24 w-24 rounded-full bg-white/5"
              />

              <Avatar className="h-14 w-14 flex-shrink-0">
                <AvatarFallback className="bg-white/20 text-white text-xl font-display font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <p className="font-body text-primary-foreground/70 text-sm">
                  {greeting()},
                </p>
                <h1 className="font-display text-2xl font-black">
                  {isLoading ? "Loading..." : (profile?.name ?? "Farmer")}
                </h1>
                <div className="flex items-center gap-2 mt-1.5">
                  {profile?.role && (
                    <Badge className="bg-white/20 text-white border-white/20 font-body text-xs font-semibold capitalize hover:bg-white/30">
                      {profile.role}
                    </Badge>
                  )}
                  {profile?.location && (
                    <span className="font-body text-xs text-primary-foreground/60">
                      📍 {profile.location}
                    </span>
                  )}
                  {profile?.farmSize && (
                    <span className="font-body text-xs text-primary-foreground/60">
                      🌾 {profile.farmSize}
                    </span>
                  )}
                </div>
              </div>

              <Link to="/profile">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent font-body font-semibold flex-shrink-0"
                  data-ocid="dashboard.edit_button"
                >
                  Edit Profile
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Modules section */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Platform Modules
              </h2>
              <p className="font-body text-sm text-muted-foreground mt-0.5">
                New features are being built — stay tuned!
              </p>
            </div>
            <Badge variant="outline" className="font-body text-xs">
              <Clock className="mr-1 h-3 w-3" />
              Module 1 Active
            </Badge>
          </div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {modules.map((mod, idx) => (
              <motion.div
                key={mod.title}
                variants={item}
                data-ocid={`dashboard.item.${idx + 1}`}
              >
                {mod.status === "available" ? (
                  <Link to={mod.href as "/profile"}>
                    <Card className="h-full border-border/60 shadow-xs hover:shadow-card hover:border-primary/30 transition-all duration-300 cursor-pointer group">
                      <CardContent className="pt-5 pb-5">
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${mod.bg}`}
                          >
                            <mod.icon className={`h-5 w-5 ${mod.color}`} />
                          </div>
                          <Badge
                            variant="default"
                            className="font-body text-[10px] font-bold tracking-wider uppercase bg-primary/15 text-primary hover:bg-primary/20 border-0"
                          >
                            Available
                          </Badge>
                        </div>
                        <h3 className="font-display text-sm font-bold text-foreground mb-1">
                          {mod.title}
                        </h3>
                        <p className="font-body text-xs text-muted-foreground leading-relaxed">
                          {mod.description}
                        </p>
                        <div className="mt-3 flex items-center text-xs font-body font-semibold text-primary gap-1 group-hover:gap-2 transition-all">
                          Open <ArrowRight className="h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ) : (
                  <Card className="h-full border-border/40 shadow-xs opacity-70 cursor-default">
                    <CardContent className="pt-5 pb-5">
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${mod.bg} opacity-60`}
                        >
                          <mod.icon className={`h-5 w-5 ${mod.color}`} />
                        </div>
                        <Badge
                          variant="secondary"
                          className="font-body text-[10px] font-bold tracking-wider uppercase"
                        >
                          Coming Soon
                        </Badge>
                      </div>
                      <h3 className="font-display text-sm font-bold text-muted-foreground mb-1">
                        {mod.title}
                      </h3>
                      <p className="font-body text-xs text-muted-foreground/70 leading-relaxed">
                        {mod.description}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
