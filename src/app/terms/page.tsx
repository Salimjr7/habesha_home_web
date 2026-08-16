export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Legal
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-muted-foreground">Last updated: August 2026</p>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl border border-border/80 bg-card space-y-6 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">1. Introduction</h2>
          <p>
            Welcome to Habesha Home. By accessing our platform, booking accommodations, or listing properties in Ethiopia, you agree to comply with and be bound by these Terms of Service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">2. Booking and Payments in ETB</h2>
          <p>
            All bookings are charged in Ethiopian Birr (ETB). Payments processed through Chapa or telebirr are held in escrow until 24 hours after verified check-in. Hosts receive payouts minus our 5% platform service fee.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">3. Host Verification and Assurances</h2>
          <p>
            Property owners warrant that listed homes accurately represent generator capacities, water reservoir sizes, and compound security. Misrepresentation of essential amenities may result in immediate listing suspension.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">4. Cancellation and Refunds</h2>
          <p>
            Reservations cancelled at least 48 hours prior to local check-in time are eligible for a 100% refund. Late cancellations may incur a one-night fee.
          </p>
        </section>
      </div>
    </div>
  );
}
