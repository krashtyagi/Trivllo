"use client";

import React, { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { toast } from "sonner";

export default function ShareButtons({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(url || window.location.href);
        setCopied(true);
        toast.success("Article link copied to clipboard!");
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      toast.error("Could not copy link");
    }
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`Check out "${title}" on Trivllo:`);
    const shareUrl = encodeURIComponent(url);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`Check out this travel guide: "${title}" - ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card hover:bg-muted text-xs font-semibold text-foreground border border-border shadow-xs transition-colors cursor-pointer"
        title="Copy link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-500">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Copy Link</span>
          </>
        )}
      </button>

      <button
        onClick={shareToWhatsApp}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 transition-colors cursor-pointer"
        title="Share to WhatsApp"
        aria-label="Share to WhatsApp"
      >
        <span className="text-xs font-bold">WA</span>
      </button>

      <button
        onClick={shareToTwitter}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-card hover:bg-muted text-foreground border border-border transition-colors cursor-pointer"
        title="Share on X"
        aria-label="Share on X"
      >
        <span className="text-xs font-bold">𝕏</span>
      </button>
    </div>
  );
}
