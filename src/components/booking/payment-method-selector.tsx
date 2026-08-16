"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreditCard, Phone, CheckCircle2, ShieldCheck, Lock } from "lucide-react";
import { initializePaymentAction } from "@/server/actions/payment.actions";
import { toast } from "sonner";

interface PaymentMethodSelectorProps {
  bookingId: string;
}

export function PaymentMethodSelector({ bookingId }: PaymentMethodSelectorProps) {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState<"CHAPA" | "TELEBIRR">("CHAPA");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const res = await initializePaymentAction({
        bookingId,
        provider: selectedProvider,
      });

      if (!res.success) {
        toast.error(res.error.message || "Failed to initialize payment");
        return;
      }

      const paymentData = res.data as { checkoutUrl?: string };
      if (paymentData.checkoutUrl) {
        toast.success("Redirecting to payment gateway...");
        router.push(paymentData.checkoutUrl);
      } else {
        toast.error("No checkout URL received");
      }
    } catch {
      toast.error("An unexpected error occurred during payment setup.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl border border-border/70 bg-card space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Select Payment Method</h2>
        <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
          <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Option 1: Chapa */}
        <div
          onClick={() => setSelectedProvider("CHAPA")}
          className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
            selectedProvider === "CHAPA"
              ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
              : "border-border/80 bg-background/50 hover:border-border"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            {selectedProvider === "CHAPA" && (
              <CheckCircle2 className="w-5 h-5 text-primary" />
            )}
          </div>
          <h3 className="font-bold text-sm text-foreground">Chapa Gateway</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Debit/Credit Cards, CBE Birr, Awash Bank, Dashen, Telebirr &amp; Internet Banking
          </p>
          <div className="mt-3 pt-2 border-t border-border/40 text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
            Instant Confirmation
          </div>
        </div>

        {/* Option 2: telebirr */}
        <div
          onClick={() => setSelectedProvider("TELEBIRR")}
          className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
            selectedProvider === "TELEBIRR"
              ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
              : "border-border/80 bg-background/50 hover:border-border"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            {selectedProvider === "TELEBIRR" && (
              <CheckCircle2 className="w-5 h-5 text-primary" />
            )}
          </div>
          <h3 className="font-bold text-sm text-foreground">telebirr Direct</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Direct mobile wallet payment using your Ethio Telecom Telebirr account
          </p>
          <div className="mt-3 pt-2 border-t border-border/40 text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            Zero Extra Fees
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button
          onClick={handlePay}
          disabled={isProcessing}
          className="w-full h-12 text-base font-bold bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white shadow-lg shadow-amber-500/25 hover:opacity-95"
        >
          {isProcessing ? "Connecting to Gateway..." : `Pay with ${selectedProvider === "CHAPA" ? "Chapa" : "telebirr"}`}
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        Safe &amp; authorized by the National Bank of Ethiopia (NBE) guidelines.
      </p>
    </div>
  );
}
