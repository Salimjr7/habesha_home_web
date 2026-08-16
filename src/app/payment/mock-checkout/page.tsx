"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, use } from "react";
import { formatETB } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import { verifyPaymentAction } from "@/server/actions/payment.actions";
import { toast } from "sonner";

export default function MockCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string; tx_ref?: string; amount?: string; currency?: string }>;
}) {
  const params = use(searchParams);
  const router = useRouter();
  const provider = params.provider || "chapa";
  const txRef = params.tx_ref || `HH-MOCK-${Date.now()}`;
  const amount = parseInt(params.amount || "850000", 10);

  const [pin, setPin] = useState("1234");
  const [phoneNumber, setPhoneNumber] = useState("+251 91 122 3344");
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const isTelebirr = provider.toLowerCase() === "telebirr";

  const handleAuthorizePayment = async () => {
    setIsAuthorizing(true);
    try {
      // Simulate gateway approval and trigger server verification
      const res = await verifyPaymentAction(txRef);

      if (res.success) {
        toast.success("Payment authorized successfully!");
        router.push(`/payment/success?tx_ref=${encodeURIComponent(txRef)}&bookingId=${(res.data as any).bookingId}`);
      } else {
        toast.error(res.error.message || "Payment verification failed.");
      }
    } catch {
      toast.error("Failed to complete transaction.");
    } finally {
      setIsAuthorizing(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-5">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-white text-sm shadow-md ${
                isTelebirr ? "bg-blue-600 shadow-blue-600/30" : "bg-amber-600 shadow-amber-600/30"
              }`}
            >
              {isTelebirr ? "tb" : "Ch"}
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground">
                {isTelebirr ? "telebirr Payment Portal" : "Chapa Secure Checkout"}
              </h2>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Habesha Home Sandbox
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <Lock className="w-3.5 h-3.5" /> Secured
          </div>
        </div>

        {/* Amount Banner */}
        <div className="p-4 rounded-2xl bg-secondary/50 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block">Total Amount</span>
            <span className="text-xl font-extrabold text-foreground">{formatETB(amount)}</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">ETB</span>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-foreground block">
              {isTelebirr ? "telebirr Phone Number" : "Debit / Credit Card or Phone"}
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-input bg-background/60 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-foreground block">
              {isTelebirr ? "telebirr PIN Code" : "Security PIN / CVV"}
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={6}
              className="w-full h-11 px-4 rounded-xl border border-input bg-background/60 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Pay Button */}
        <Button
          onClick={handleAuthorizePayment}
          disabled={isAuthorizing}
          className={`w-full h-12 text-base font-bold text-white shadow-lg transition-all ${
            isTelebirr
              ? "bg-blue-600 hover:bg-blue-500 shadow-blue-600/25"
              : "bg-amber-600 hover:bg-amber-500 shadow-amber-600/25"
          }`}
        >
          {isAuthorizing ? (
            "Verifying with NBE Gateway..."
          ) : (
            <span className="flex items-center justify-center gap-2">
              Authorize Payment {formatETB(amount)} <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>

        <div className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Test Transaction Sandbox • No real funds deducted
        </div>
      </div>
    </div>
  );
}
