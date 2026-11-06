import React, { useState } from "react";
import {
    Copy,
    Share2,
    Code2,
    MessageCircle,
    Send,
    Facebook,
    Mail,
    MoreHorizontal,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SOCIAL_PLATFORMS = [
    {
        name: "WhatsApp",
        icon: <MessageCircle className="h-6 w-6" />,
        bg: "bg-[#25D366] hover:bg-[#1ebd5e]",
        action: (url: string) => window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, "_blank"),
    },
    {
        name: "Facebook",
        icon: <Facebook className="h-6 w-6" />,
        bg: "bg-[#1877F2] hover:bg-[#166fe5]",
        action: (url: string) => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank"),
    },
    {
        name: "X",
        icon: <span className="font-bold text-xl text-white">𝕏</span>,
        bg: "bg-black hover:bg-zinc-800",
        action: (url: string) => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, "_blank"),
    },
    {
        name: "Reddit",
        icon: <Send className="h-6 w-6" />,
        bg: "bg-[#FF4500] hover:bg-[#e63e00]",
        action: (url: string) => window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(url)}`, "_blank"),
    },
    {
        name: "Email",
        icon: <Mail className="h-6 w-6" />,
        bg: "bg-zinc-600 hover:bg-zinc-500",
        action: (url: string) => window.location.href = `mailto:?body=${encodeURIComponent(url)}`,
    },
    // {
    //     name: "Embed",
    //     icon: <Code2 className="h-6 w-6" />,
    //     bg: "bg-zinc-800 hover:bg-zinc-700",
    //     action: () => alert("Embed logic here"),
    // },
];

export function ShareModal({ className }: { className?: string }) {
    const videoUrl = typeof window !== "undefined" ? window.location.href : "";
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(videoUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success("Link copied to clipboard");
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className={cn("gap-2 rounded-full px-3 sm:px-6 text-xs md:text-md " , className)}>
                    <Share2 className="h-2 w-2 md:h-4 md:w-4" />
                    <span className="hidden sm:block">Share</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="w-[95vw] sm:max-w-[500px] bg-background border-border text-foreground p-0 overflow-hidden rounded-2xl sm:rounded-3xl">
                <DialogHeader className="px-6 py-4 flex flex-row items-center justify-between border-b border-border">
                    <DialogTitle className="text-lg font-medium">Share</DialogTitle>
                </DialogHeader>

                <div className="py-6">
                    {/* Social Icons Grid (Responsive) */}
                    <div className="px-2 sm:px-3 overflow-x-hidden">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 px-2  overflow-x-hidden">
                            {SOCIAL_PLATFORMS.map((platform) => (
                                <button
                                    key={platform.name}
                                    onClick={() => platform.action(videoUrl)}
                                    className="flex flex-col items-center w-[60px] sm:w-[70px] md:w-[90px] transition-transform active:scale-90"
                                >
                                    <div
                                        className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center text-white shadow-md ${platform.bg}`}
                                    >
                                        {platform.icon}
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-medium text-zinc-400 text-center truncate w-full">
                                        {platform.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="px-4 mt-6 space-y-5">
                        {/* URL Copy Section */}
                        <div className="flex items-center gap-2 sm:gap-3 bg-secondary/50 border border-border rounded-xl p-2 pl-3 sm:pl-4">
                            <span className="text-xs sm:text-sm text-foreground truncate sm:overflow-visible flex-1 cursor-pointer max-w-full " onClick={handleCopy}>
                                {videoUrl}
                            </span>

                            {/* <Button
                                onClick={handleCopy}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-3 sm:px-5 h-8 sm:h-9 shrink-0"
                            >
                                {copied ? "Copied" : "Copy"}
                            </Button> */}
                        </div>


                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}




