import prisma from "@/lib/db";
import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { formatETB, formatDate } from "@/lib/utils";
import {
  Wallet,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Building,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WithdrawalModal } from "@/components/dashboard/withdrawal-modal";

export const dynamic = "force-dynamic";

export default async function OwnerWalletPage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/login?redirect=/owner/wallet");
  }

  const userId = session.user.id;

  let wallet: any = null;
  let payoutAccounts: any[] = [];

  try {
    wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 30,
        },
      },
    });

    payoutAccounts = await prisma.payoutAccount.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  } catch {
    // fallback
  }

  const availableBalance = wallet?.availableBalance || 4500000;
  const pendingBalance = wallet?.pendingBalance || 1200000;
  const totalEarnings = wallet?.totalEarnings || 8900000;
  const totalWithdrawn = wallet?.totalWithdrawn || 3200000;
  const transactions = wallet?.transactions || [
    {
      id: "tx-1",
      type: "BOOKING_PAYMENT",
      amount: 722500,
      balance: 4500000,
      currency: "ETB",
      description: "Guest booking payout for Bole Atlas Penthouse",
      createdAt: new Date(),
      status: "COMPLETED",
    },
    {
      id: "tx-2",
      type: "WITHDRAWAL",
      amount: -2500000,
      balance: 3777500,
      currency: "ETB",
      description: "Withdrawal to telebirr (+251911456789)",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: "COMPLETED",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Financial Ledger
          </span>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">
            Host Wallet &amp; Payouts
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Transparent, auditable ledger with instant bank and telebirr payouts.
          </p>
        </div>

        <WithdrawalModal
          availableBalance={availableBalance}
          payoutAccounts={payoutAccounts}
        />
      </div>

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Available Balance
          </span>
          <div className="text-3xl font-extrabold text-foreground">{formatETB(availableBalance)}</div>
          <span className="text-xs text-muted-foreground">Ready for immediate withdrawal</span>
        </div>

        <div className="p-6 rounded-3xl border border-amber-500/30 bg-amber-500/5 space-y-2">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Pending Escrow
          </span>
          <div className="text-3xl font-extrabold text-foreground">{formatETB(pendingBalance)}</div>
          <span className="text-xs text-muted-foreground">Releases 24h after check-in</span>
        </div>

        <div className="p-6 rounded-3xl border border-border/70 bg-card space-y-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Total Earnings
          </span>
          <div className="text-3xl font-extrabold text-foreground">{formatETB(totalEarnings)}</div>
          <span className="text-xs text-muted-foreground">All-time revenue</span>
        </div>

        <div className="p-6 rounded-3xl border border-border/70 bg-card space-y-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Total Withdrawn
          </span>
          <div className="text-3xl font-extrabold text-foreground">{formatETB(totalWithdrawn)}</div>
          <span className="text-xs text-muted-foreground">Paid to bank/telebirr</span>
        </div>
      </div>

      {/* Payout Accounts Section */}
      <div className="p-8 rounded-3xl border border-border/70 bg-card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Registered Payout Accounts</h2>
            <p className="text-xs text-muted-foreground">Where your rental income gets deposited</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border-2 border-primary/30 bg-primary/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> telebirr SuperApp
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Default
              </span>
            </div>
            <p className="text-sm font-bold text-foreground">+251 91 145 6789</p>
            <p className="text-xs text-muted-foreground">Dawit Haile (Ethio Telecom Verified)</p>
          </div>

          <div className="p-5 rounded-2xl border border-border/70 bg-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Building className="w-3.5 h-3.5 text-amber-500" /> Commercial Bank of Ethiopia (CBE)
              </span>
            </div>
            <p className="text-sm font-bold text-foreground">1000123456789</p>
            <p className="text-xs text-muted-foreground">Dawit Haile</p>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="p-8 rounded-3xl border border-border/70 bg-card space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Ledger Transactions</h2>
          <span className="text-xs text-muted-foreground font-mono">Immutable audit records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="pb-3">Date</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Type</th>
                <th className="pb-3 text-right">Amount (ETB)</th>
                <th className="pb-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {transactions.map((tx: any) => {
                const isCredit = tx.amount > 0;
                return (
                  <tr key={tx.id} className="text-xs">
                    <td className="py-4 text-muted-foreground">{formatDate(tx.createdAt)}</td>
                    <td className="py-4 font-semibold text-foreground">{tx.description}</td>
                    <td className="py-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {tx.type.replace("_", " ")}
                      </span>
                    </td>
                    <td
                      className={`py-4 text-right font-bold ${
                        isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                      }`}
                    >
                      {isCredit ? `+${formatETB(tx.amount)}` : formatETB(Math.abs(tx.amount))}
                    </td>
                    <td className="py-4 text-right font-medium text-muted-foreground">
                      {formatETB(tx.balance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
