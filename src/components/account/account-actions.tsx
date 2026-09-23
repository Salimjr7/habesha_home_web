"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth/client";
import { deleteAccountAction } from "@/server/actions/user.actions";
import { Button } from "@/components/ui/button";
import { LogOut, Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface AccountActionsProps {
  showLogoutButton?: boolean;
  showDeleteButton?: boolean;
}

export function AccountActions({
  showLogoutButton = true,
  showDeleteButton = true,
}: AccountActionsProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteAccountAction();
      if (!res.success) {
        toast.error(res.error?.message || "Failed to delete account");
        return;
      }

      await signOut();
      toast.success("Your account has been permanently removed.");
      setShowDeleteModal(false);
      router.push("/");
      router.refresh();
    } catch {
      toast.error("An error occurred while deleting your account.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {/* Log Out Button */}
        {showLogoutButton && (
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut || isDeleting}
            className="font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary border-border"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            Log Out
          </Button>
        )}

        {/* Delete / Remove Account Button */}
        {showDeleteButton && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowDeleteModal(true)}
            disabled={isLoggingOut || isDeleting}
            className="font-semibold text-red-600 hover:text-red-700 hover:bg-red-500/10 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove Account
          </Button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-destructive/30 bg-card p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-foreground">
                Delete Your Account?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This action is permanent and cannot be undone. All your listings, reservations, favorites, and profile data will be permanently deleted from EthioHome.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Yes, Delete Account
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
