"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatETB } from "@/lib/utils";
import { ArrowUpRight, X, ShieldCheck } from "lucide-react";
import { requestWithdrawalAction } from "@/server/actions/wallet.actions";
import { toast } from "sonner";

interface WithdrawalModalProps {
  availableBalance: number;
  payoutAccounts: Array<{
    id: string;
    provider: string;
    accountName: string;
    accountNumber: string;
    bankName?: string | null;
  }>;
}

export function WithdrawalModal({ availableBalance, payoutAccounts }: WithdrawalModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(10000); // In ETB
  const [selectedAccountId, setSelectedAccountId] = useState(payoutAccounts[0]?.id || "default-acc");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount * 100 > availableBalance) {
      toast.error("Invalid withdrawal amount or exceeds available balance.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestWithdrawalAction({
        amount: amount * 100, // convert to cents
        payoutAccountId: selectedAccountId,
      });

      if (!res.success) {
        toast.error(res.error.message || "Failed to submit withdrawal.");
        return;
      }

      toast.success("Withdrawal request submitted! Funds will be transferred shortly.");
      setIsOpen(false);
    } catch {
      toast.error("Withdrawal submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="font-bold bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/20"
      >
        <ArrowUpRight className="w-4 h-4 mr-2" /> Request Payout
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h3 className="font-bold text-lg text-foreground">Withdraw Rental Earnings</h3>
                <span className="text-xs text-muted-foreground">
                  Available: {formatETB(availableBalance)}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Withdrawal Amount (ETB)
                </label>
                <div className="flex items-center gap-3 p-3 rounded-2xl border border-input bg-background/50">
                  <span className="font-extrabold text-foreground">ETB</span>
                  <input
                    type="number"
                    min={100}
                    max={availableBalance / 100}
                    step={100}
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-transparent text-lg font-black text-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Account Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Destination Payout Account
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full h-12 px-3 rounded-2xl border border-input bg-background/50 text-foreground text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="default-acc" className="bg-card text-foreground">telebirr (+251 91 145 6789)</option>
                  <option value="cbe-acc" className="bg-card text-foreground">Commercial Bank of Ethiopia (CBE - 1000123456789)</option>
                  <option value="awash-acc" className="bg-card text-foreground">Awash Bank (AWSH - 0132049281)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-secondary/50 text-xs text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                Processed in Ethiopian Birr with no hidden transfer fees.
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || amount * 100 > availableBalance}
                className="w-full h-12 font-bold bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/20"
              >
                {isSubmitting ? "Processing Transfer..." : `Withdraw ${formatETB(amount * 100)}`}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
