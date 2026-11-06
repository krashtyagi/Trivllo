// components/CompactFooter.tsx
import { Github, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import Link from "next/link";
import trivlloData from "@/../trivllo.json";

export function CompactFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40 py-5 text-sm text-muted-foreground">
      <div className="container mx-auto px-6 flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
        <div>
          Copyright © {currentYear} {trivlloData.company_name}
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms and Conditions
          </Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-5">
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X">
            <Twitter className="h-4 w-4 hover:text-foreground transition-colors" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <Instagram className="h-4 w-4 hover:text-foreground transition-colors" />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <Youtube className="h-4 w-4 hover:text-foreground transition-colors" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <Linkedin className="h-4 w-4 hover:text-foreground transition-colors" />
          </a>
        </div>
      </div>
    </footer>
  );
}