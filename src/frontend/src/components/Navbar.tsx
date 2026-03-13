import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();

  const NAV_LINKS = [
    { to: "/marketplace", label: t("nav_marketplace") },
    { to: "/store", label: t("nav_store") },
    { to: "/equipment", label: t("nav_equipment") },
    { to: "/schemes", label: t("nav_schemes") },
    { to: "/crop-advisor", label: t("nav_crop_advisor") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/90 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" data-ocid="nav.link">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <span className="font-display text-base font-bold leading-none text-foreground">
              Smart Farming
            </span>
            <span className="block text-[10px] font-body font-medium text-muted-foreground leading-none tracking-widest uppercase">
              AI Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-1.5 rounded-md font-body text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              data-ocid="nav.link"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="font-body font-semibold text-xs h-8 px-3 hidden md:flex"
            data-ocid="lang.toggle"
          >
            {lang === "en" ? "हिंदी" : "EN"}
          </Button>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            data-ocid="nav.toggle"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/60 bg-card/95 px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-2 rounded-md font-body text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(false)}
              data-ocid="nav.link"
            >
              {link.label}
            </Link>
          ))}
          {/* Language Toggle Mobile */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="font-body font-semibold text-xs mt-2 w-full"
            data-ocid="lang.toggle"
          >
            {lang === "en" ? "हिंदी में देखें" : "View in English"}
          </Button>
        </div>
      )}
    </header>
  );
}
