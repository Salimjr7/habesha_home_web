"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deletePropertyAction } from "@/server/actions/property.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteListingButtonProps {
  propertyId: string;
  propertyTitle: string;
  onOptimisticDelete?: (propertyId: string) => void;
  onDeleteRollback?: (propertyId: string) => void;
}

export function DeleteListingButton({
  propertyId,
  propertyTitle,
  onOptimisticDelete,
  onDeleteRollback,
}: DeleteListingButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConfirmDelete = () => {
    // 1. Immediately dismiss modal (0ms latency)
    setShowConfirm(false);

    // 2. Immediately trigger optimistic removal in parent UI (0ms latency)
    if (onOptimisticDelete) {
      onOptimisticDelete(propertyId);
    }

    // 3. Immediately show feedback toast
    const toastId = toast.loading(`Deleting "${propertyTitle}"...`);

    // 4. Execute deletion asynchronously in background without blocking UI
    deletePropertyAction(propertyId)
      .then((res) => {
        if (!res.success) {
          toast.error(res.error?.message || "Failed to delete listing", { id: toastId });
          onDeleteRollback?.(propertyId);
        } else {
          toast.success(`"${propertyTitle}" has been permanently deleted.`, { id: toastId });
          router.refresh();
        }
      })
      .catch(() => {
        toast.error("Something went wrong deleting the listing.", { id: toastId });
        onDeleteRollback?.(propertyId);
      });
  };

  const modalContent =
    showConfirm && mounted ? (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-100"
        onClick={() => setShowConfirm(false)}
      >
        <div
          className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Delete Listing</h3>
              <p className="text-xs text-muted-foreground">This action cannot be undone</p>
            </div>
          </div>

          <p className="text-sm text-foreground/80 leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <span className="font-bold text-foreground">&quot;{propertyTitle}&quot;</span>?
            All reviews, bookings, favorites, and images associated with this listing will also be removed.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              className="flex-1 font-semibold"
              autoFocus
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="flex-1 font-bold shadow-md bg-destructive hover:bg-destructive/90"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Permanently
            </Button>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowConfirm(true)}
        className="w-full text-xs text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
      </Button>

      {mounted && modalContent ? createPortal(modalContent, document.body) : null}
    </>
  );
}
