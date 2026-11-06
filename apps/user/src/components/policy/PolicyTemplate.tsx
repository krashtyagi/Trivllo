import React from "react";
import Link from "next/link";
import { getPolicies, PolicySection } from "@/lib/detailsParser";
import trivlloData from "@/../trivllo.json";
import {
  Shield,
  FileText,
  Users,
  ChevronRight,
  BookOpen,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "privacy-policy": Shield,
  "terms-of-services": FileText,
  "about-us": Users,
};

const titleDisplayMap: Record<string, string> = {
  "privacy-policy": "Privacy Policy",
  "terms-of-services": "Terms & Conditions",
  "about-us": "About Us",
};

interface PolicyTemplateProps {
  currentSlug: string;
}

export default function PolicyTemplate({ currentSlug }: PolicyTemplateProps) {
  const policies = getPolicies();
  const currentSection = policies.find((p) => p.slug === currentSlug);

  if (!currentSection) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 animate-in fade-in duration-500">
        <BookOpen className="h-16 w-16 text-red-500 mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold mb-2">Policy Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The requested details page does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg transition"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const IconComponent = iconMap[currentSlug] || BookOpen;

  const renderParagraph = (text: string, pIdx: number) => {
    const parts = text.split(/\s*:\s*/);

    if (parts.length > 1 && parts[0].length < 50) {
      const heading = parts[0];
      const rest = parts.slice(1).join(" : ");

      const isListItem = rest.includes(",") || rest.includes(".");

      return (
        <div key={pIdx} className="mb-6 border-l-2 border-primary/30 pl-4 py-1 hover:border-primary transition duration-300">
          <h3 className="text-base font-bold text-foreground mb-1.5 flex items-center gap-2">
            {heading}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {rest}
          </p>
        </div>
      );
    }

    return (
      <p key={pIdx} className="text-sm text-muted-foreground leading-relaxed mb-4">
        {text}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-10 md:py-8 animate-in fade-in duration-1000">
      <div className="max-w-7xl mx-auto px-4 sm:px-3 lg:px-4">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-50 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 md:p-8 mb-10 shadow-sm">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
              <IconComponent className="h-8 w-8" />
            </div>
            <div>
              <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <Link href="/" className="hover:text-primary transition">Home</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-primary font-medium">
                  {titleDisplayMap[currentSlug] || currentSection.title}
                </span>
              </nav>
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-foreground">
                {titleDisplayMap[currentSlug] || currentSection.title}
              </h1>
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: June 2026 • {trivlloData.company_name} Customer Protection
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">

          <aside className="lg:col-span-1">
            <div className="lg:hidden z-30 sticky top-10 bg-white/50 dark:bg-background/30 backdrop-blur-md border-b border-t h-16 flex items-center -mx-4 px-4 md:px-6 mb-8">
              <div className="flex gap-6 overflow-x-auto no-scrollbar w-full">
                {policies.map((policy) => {
                  const SidebarIcon = iconMap[policy.slug] || BookOpen;
                  const isActive = policy.slug === currentSlug;
                  return (
                    <Link
                      key={policy.slug}
                      href={`/${policy.slug}`}
                      className={`capitalize whitespace-nowrap pb-1 border-b-2 text-sm font-semibold transition-all flex-shrink-0 flex items-center gap-1.5 ${isActive
                        ? "border-primary text-primary dark:text-primary"
                        : "border-transparent text-slate-600 hover:text-slate-900 hover:border-primary dark:hover:text-primary"
                        }`}
                    >
                      <SidebarIcon className="h-4 w-4" />
                      <span>{titleDisplayMap[policy.slug] || policy.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="hidden lg:block sticky top-24 bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                Policies & Company
              </h2>
              <nav className="flex flex-col space-y-1">
                {policies.map((policy) => {
                  const SidebarIcon = iconMap[policy.slug] || BookOpen;
                  const isActive = policy.slug === currentSlug;
                  return (
                    <Link
                      key={policy.slug}
                      href={`/${policy.slug}`}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                        ? "bg-primary text-white shadow-sm shadow-red-500/10"
                        : "text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-foreground"
                        }`}
                    >
                      <SidebarIcon className="h-4.5 w-4.5 flex-shrink-0" />
                      <span className="truncate">
                        {titleDisplayMap[policy.slug] || policy.title}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 md:p-10 shadow-sm">
              <div className="prose prose-zinc dark:prose-invert max-w-none">
                {currentSection.paragraphs.map((p, idx) => renderParagraph(p, idx))}
              </div>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
