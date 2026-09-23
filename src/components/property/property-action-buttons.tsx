"use client";

import { useState, useTransition } from "react";
import { Share2, Heart, Copy, Check, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavoriteAction } from "@/server/actions/favorite.actions";
import { useSession } from "@/lib/auth/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PropertyActionButtonsProps {
  propertyId: string;
  title: string;
  slug: string;
  initialIsFavorite?: boolean;
}

export function PropertyActionButtons({
  propertyId,
  title,
  slug,
  initialIsFavorite = false,
}: PropertyActionButtonsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://ethiohome.et/property/${slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} | EthioHome`,
          text: `Check out this verified Ethiopian property on EthioHome!`,
          url,
        });
        toast.success("Shared successfully!");
        return;
      } catch (err: any) {
        if (err.name !== "AbortError") {
          // Fall through to share menu
        }
      }
    }

    setShowShareMenu(!showShareMenu);
  };

  const handleCopyLink = async () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://ethiohome.et/property/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
      setShowShareMenu(false);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleToggleFavorite = () => {
    if (!session?.user) {
      toast.info("Please sign in to save properties to your favorites", {
        action: {
          label: "Sign In",
          onClick: () => router.push(`/login?redirect=/property/${slug}`),
        },
      });
      return;
    }

    // Optimistic UI update
    const nextState = !isFavorite;
    setIsFavorite(nextState);

    startTransition(async () => {
      try {
        const res = await toggleFavoriteAction(propertyId);
        if (res.success) {
          if (nextState) {
            toast.success("Saved to your favorites!");
          } else {
            toast.info("Removed from your favorites");
          }
        } else {
          // Revert on failure
          setIsFavorite(!nextState);
          toast.error("Could not update favorites");
        }
      } catch {
        setIsFavorite(!nextState);
        toast.error("An error occurred");
      }
    });
  };

  return (
    <div className="relative flex items-center gap-3 shrink-0">
      {/* Share Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="rounded-xl border-border/80 hover:bg-secondary font-medium transition-colors"
      >
        <Share2 className="w-4 h-4 mr-2" /> Share
      </Button>

      {/* Share Dropdown Menu */}
      {showShareMenu && (
        <div className="absolute top-11 right-12 z-50 w-64 p-3 rounded-2xl border border-border/80 bg-card shadow-2xl space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-1 border-b border-border/50 text-xs font-bold text-foreground">
            <span>Share this home</span>
            <button
              type="button"
              onClick={() => setShowShareMenu(false)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-secondary/60 hover:bg-secondary text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? "Link Copied!" : "Copy Link"}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase">URL</span>
          </button>

          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.href : ""
            )}&text=${encodeURIComponent(`Check out ${title} on EthioHome:`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setShowShareMenu(false)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-secondary text-foreground transition-colors"
          >
            <Send className="w-4 h-4 text-blue-500" /> Share on Telegram
          </a>

          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
              `Check out ${title} on EthioHome: ` + (typeof window !== "undefined" ? window.location.href : "")
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setShowShareMenu(false)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-secondary text-foreground transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-green-500" /> Share on WhatsApp
          </a>
        </div>
      )}

      {/* Like / Save Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleToggleFavorite}
        disabled={isPending}
        className={`rounded-xl border-border/80 transition-all ${
          isFavorite
            ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20"
            : "hover:bg-secondary"
        }`}
      >
        <Heart
          className={`w-4 h-4 mr-2 transition-transform duration-200 ${
            isFavorite ? "fill-red-500 text-red-500 scale-110" : "text-muted-foreground"
          }`}
        />
        {isFavorite ? "Saved" : "Save"}
      </Button>
    </div>
  );
}
