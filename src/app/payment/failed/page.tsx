import Link from "next/link";
import { XCircle, RefreshCw, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface FailedPageProps {
  searchParams: Promise<{ bookingId?: string; reason?: string }>;
}

export default async function PaymentFailedPage({ searchParams }: FailedPageProps) {
  const { bookingId, reason } = await searchParams;

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-8 sm:p-10 shadow-2xl text-center space-y-6">
        {/* Failed Icon */}
        <div className="w-20 h-20 rounded-3xl bg-red-500/15 text-red-500 flex items-center justify-center mx-auto shadow-lg shadow-red-500/10">
          <XCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-red-500">
            Transaction Unsuccessful
          </span>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Payment Not Completed
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {reason || "Your bank or telebirr account was not charged. Please try again or choose an alternative payment option."}
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          {bookingId ? (
            <Link href={`/property/${bookingId}/book`}>
              <Button className="w-full font-bold bg-primary text-primary-foreground">
                <RefreshCw className="w-4 h-4 mr-2" /> Retry Payment
              </Button>
            </Link>
          ) : (
            <Link href="/search">
              <Button className="w-full font-bold bg-primary text-primary-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" /> Return to Discovery
              </Button>
            </Link>
          )}

          <Link href="/help">
            <Button variant="outline" className="w-full text-xs">
              <HelpCircle className="w-3.5 h-3.5 mr-1.5" /> Payment Assistance &amp; FAQ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
