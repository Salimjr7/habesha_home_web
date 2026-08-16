export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Privacy
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-muted-foreground">Last updated: August 2026</p>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl border border-border/80 bg-card space-y-6 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">1. Information We Collect</h2>
          <p>
            We collect personal information necessary to deliver our rental marketplace services, including name, email address, Ethiopian phone number (for telebirr integration), and identity verification documents for hosts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">2. Financial Data Security</h2>
          <p>
            Payment transactions are processed through regulated Ethiopian payment providers (Chapa, Ethio Telecom telebirr). Habesha Home does not store full credit card numbers or banking passwords on our servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">3. Communication &amp; Chat</h2>
          <p>
            Messages between guests and hosts are transmitted securely to facilitate check-in logistics and support inquiry resolution.
          </p>
        </section>
      </div>
    </div>
  );
}
