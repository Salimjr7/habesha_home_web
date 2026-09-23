"use client";

import { useState } from "react";
import { Star, MessageSquarePlus, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth/client";
import { submitPropertyReviewAction } from "@/server/actions/review.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ReviewItem {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: Date | string;
  author: {
    id: string;
    name: string;
    image?: string | null;
  };
}

interface PropertyReviewSectionProps {
  propertyId: string;
  slug: string;
  avgRating: number;
  reviewCount: number;
  reviews: ReviewItem[];
}

export function PropertyReviewSection({
  propertyId,
  slug,
  avgRating,
  reviewCount,
  reviews,
}: PropertyReviewSectionProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [reviewList, setReviewList] = useState<ReviewItem[]>(reviews);
  const [currentAvgRating, setCurrentAvgRating] = useState(avgRating);
  const [currentReviewCount, setCurrentReviewCount] = useState(reviewCount);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ratingLabels: Record<number, string> = {
    1: "Poor experience",
    2: "Fair, needs improvement",
    3: "Good stay",
    4: "Great experience",
    5: "Exceptional! 100% recommended",
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.info("Please sign in to leave a review", {
        action: {
          label: "Sign In",
          onClick: () => router.push(`/login?redirect=/property/${slug}#reviews`),
        },
      });
      return;
    }

    if (!rating || rating < 1) {
      toast.error("Please select a star rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitPropertyReviewAction({
        propertyId,
        rating,
        comment: comment.trim(),
      });

      if (!res.success) {
        toast.error(res.error?.message || "Failed to submit review");
        return;
      }

      toast.success("Thank you! Your rating and review have been published.");
      setShowReviewForm(false);

      // Optimistically update local review list
      const savedReview = (res.data as any) || {};
      const newReviewItem: ReviewItem = {
        id: savedReview.id || `temp-${Date.now()}`,
        rating,
        comment: comment.trim(),
        createdAt: new Date(),
        author: {
          id: session.user.id,
          name: session.user.name || "You",
          image: session.user.image,
        },
      };

      setReviewList((prev) => {
        const filtered = prev.filter((r) => r.author?.id !== session.user.id);
        const updated = [newReviewItem, ...filtered];
        const newTotal = updated.reduce((sum, r) => sum + r.rating, 0);
        setCurrentAvgRating(Number((newTotal / updated.length).toFixed(2)));
        setCurrentReviewCount(updated.length);
        return updated;
      });

      setComment("");
      router.refresh();
    } catch {
      toast.error("An error occurred while submitting your review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="reviews" className="space-y-6 border-t border-border/60 pt-8">
      {/* Header and Rating Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground">
              {currentAvgRating > 0 ? currentAvgRating.toFixed(2) : "New"}{" "}
              <span className="text-base font-normal text-muted-foreground">
                ({currentReviewCount} review{currentReviewCount === 1 ? "" : "s"})
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Ratings and comments from verified Ethiopian guests
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => {
            if (!session?.user) {
              toast.info("Please sign in to write a review", {
                action: {
                  label: "Sign In",
                  onClick: () => router.push(`/login?redirect=/property/${slug}#reviews`),
                },
              });
              return;
            }
            setShowReviewForm(!showReviewForm);
          }}
          className="font-bold bg-primary text-primary-foreground self-start sm:self-auto shadow-xs"
        >
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          {showReviewForm ? "Cancel Review" : "Write a Review"}
        </Button>
      </div>

      {/* Review Form Drawer / Card */}
      {showReviewForm && (
        <form
          onSubmit={handleSubmitReview}
          className="p-6 sm:p-8 rounded-3xl border border-primary/40 bg-card shadow-lg space-y-6 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="space-y-1">
            <h3 className="text-lg font-black text-foreground">Rate Your Experience</h3>
            <p className="text-xs text-muted-foreground">
              Select your rating from 1 to 5 stars and share your feedback with other guests.
            </p>
          </div>

          {/* Star Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Overall Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    aria-label={`${star} star`}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        isFilled
                          ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                          : "text-neutral-300 dark:text-neutral-700 hover:text-amber-300"
                      }`}
                    />
                  </button>
                );
              })}
              <span className="text-xs font-bold text-foreground ml-2">
                {ratingLabels[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Your Review / Comment
            </label>
            <textarea
              rows={4}
              required
              placeholder="How was the standby power backup, water reserve, location, and host hospitality?..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-4 rounded-2xl border border-border/80 bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReviewForm(false)}
              disabled={isSubmitting}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="font-bold bg-primary text-primary-foreground text-xs shadow-md shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Submit Rating &amp; Comment
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviewList.length > 0 ? (
          reviewList.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-3xl border border-border/70 bg-card space-y-3 shadow-xs hover:border-border transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar src={rev.author?.image} name={rev.author?.name || "Verified Guest"} size="md" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground">
                      {rev.author?.name || "Verified Guest"}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center text-amber-500 font-semibold">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span>•</span>
                      <span>
                        {new Date(rev.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                  Verified Stay
                </span>
              </div>

              {rev.comment && (
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                  {rev.comment}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-10 rounded-3xl border border-dashed border-border/80 p-8 space-y-2">
            <p className="text-sm font-semibold text-foreground">No reviews yet for this home</p>
            <p className="text-xs text-muted-foreground">
              Be the first guest to share your rating and experience!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
