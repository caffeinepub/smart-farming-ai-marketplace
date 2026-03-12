import { Leaf } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="border-t border-border/60 bg-card py-8 mt-auto">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <Leaf className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-sm font-semibold text-foreground">
            Smart Farming AI Marketplace
          </span>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          © {year}. Built with ❤️ using{" "}
          <a
            href={utmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
        <p className="text-xs text-muted-foreground">
          Empowering Indian Farmers
        </p>
      </div>
    </footer>
  );
}
