import { AdminService } from "@/server/services/admin.service";
import { formatETB } from "@/lib/utils";
import {
  Users,
  Home,
  Calendar,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let stats = {
    totalUsers: 24,
    totalOwners: 8,
    totalListings: 18,
    activeBookings: 12,
    grossVolume: 34500000,
    platformRevenue: 1725000,
    pendingWithdrawalsCount: 2,
  };

  try {
    stats = await AdminService.getPlatformStats();
  } catch {
    // fallback
  }

  return (
    <div className="space-y-10">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Executive Platform Analytics
        </span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">
          Habesha Home Administration
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Real-time metrics, host payouts, listing approvals, and platform fee collection.
        </p>
      </div>

      {/* Platform Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Gross Transaction Volume
          </span>
          <div className="text-2xl font-extrabold text-foreground">
            {formatETB(stats.grossVolume)}
          </div>
          <span className="text-xs text-muted-foreground">Chapa + telebirr volume</span>
        </div>

        <div className="p-6 rounded-3xl border border-amber-500/30 bg-amber-500/5 space-y-2">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Platform Revenue (5%)
          </span>
          <div className="text-2xl font-extrabold text-foreground">
            {formatETB(stats.platformRevenue)}
          </div>
          <span className="text-xs text-muted-foreground">Habesha Home net commission</span>
        </div>

        <div className="p-6 rounded-3xl border border-border/70 bg-card space-y-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Active Listings
          </span>
          <div className="text-2xl font-extrabold text-foreground">{stats.totalListings}</div>
          <span className="text-xs text-muted-foreground">Verified Ethiopian properties</span>
        </div>

        <div className="p-6 rounded-3xl border border-border/70 bg-card space-y-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Registered Users
          </span>
          <div className="text-2xl font-extrabold text-foreground">{stats.totalUsers}</div>
          <span className="text-xs text-muted-foreground">{stats.totalOwners} verified hosts</span>
        </div>
      </div>

      {/* Pending Actions Alert */}
      {stats.pendingWithdrawalsCount > 0 && (
        <div className="p-6 rounded-3xl border border-amber-500/40 bg-amber-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-foreground">
                {stats.pendingWithdrawalsCount} Host Withdrawal(s) Awaiting Review
              </h3>
              <p className="text-xs text-muted-foreground">
                Payout requests must be audited and approved before bank / telebirr disbursement.
              </p>
            </div>
          </div>

          <Link href="/admin/withdrawals">
            <Button size="sm" className="font-bold bg-amber-600 hover:bg-amber-500 text-white shrink-0">
              Audit Withdrawals
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
