import prisma from "@/lib/db";
import { formatETB, formatDate } from "@/lib/utils";
import { ArrowUpRight, CheckCircle2, XCircle, Clock, ShieldCheck, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import { AdminService } from "@/server/services/admin.service";

export const dynamic = "force-dynamic";

export default async function AdminWithdrawalsPage() {
  let withdrawals: any[] = [];
  try {
    withdrawals = await prisma.withdrawal.findMany({
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
        payoutAccount: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // fallback
  }

  // Server action to approve or reject withdrawal
  async function processWithdrawalAction(formData: FormData) {
    "use server";
    const withdrawalId = formData.get("withdrawalId") as string;
    const action = formData.get("action") as string;
    const isApproved = action === "approve";

    try {
      await AdminService.processWithdrawal(withdrawalId, isApproved);
      revalidatePath("/admin/withdrawals");
    } catch (e) {
      console.error("Failed to process withdrawal:", e);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Financial Governance
        </span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">
          Host Withdrawals Audit Queue
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Approve or reject host payout requests for bank and telebirr transfers.
        </p>
      </div>

      <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-4 px-6">Host</th>
                <th className="py-4 px-6">Amount (ETB)</th>
                <th className="py-4 px-6">Payout Destination</th>
                <th className="py-4 px-6">Requested</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs">
              {withdrawals.length > 0 ? (
                withdrawals.map((w) => {
                  const isPending = w.status === "PENDING";
                  return (
                    <tr key={w.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-foreground">{w.user.name}</div>
                        <div className="text-[11px] text-muted-foreground">{w.user.email}</div>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-foreground text-sm">
                        {formatETB(w.amount)}
                      </td>
                      <td className="py-4 px-6">
                        {w.payoutAccount ? (
                          <div>
                            <div className="font-semibold text-foreground">
                              {w.payoutAccount.provider === "TELEBIRR" ? "telebirr" : w.payoutAccount.bankName || "Bank"}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {w.payoutAccount.accountNumber} ({w.payoutAccount.accountName})
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">telebirr (Direct)</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-muted-foreground font-medium">
                        {formatDate(w.createdAt)}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            w.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : w.status === "REJECTED"
                              ? "bg-red-500/10 text-red-500 border border-red-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {w.status === "PENDING" && <Clock className="w-3 h-3" />}
                          {w.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isPending ? (
                          <form action={processWithdrawalAction} className="inline-flex items-center gap-2">
                            <input type="hidden" name="withdrawalId" value={w.id} />
                            <Button
                              type="submit"
                              name="action"
                              value="approve"
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                            </Button>
                            <Button
                              type="submit"
                              name="action"
                              value="reject"
                              size="sm"
                              variant="outline"
                              className="border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold text-xs h-8"
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                            </Button>
                          </form>
                        ) : (
                          <span className="text-[11px] text-muted-foreground font-semibold">
                            {w.processedAt ? `Processed ${formatDate(w.processedAt)}` : "Archived"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No withdrawal requests pending.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
