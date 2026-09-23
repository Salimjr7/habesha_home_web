import Link from "next/link";
import Image from "next/image";
import { Shield, Sparkles, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/60 backdrop-blur-md text-card-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              {/* Light Mode Logo */}
              <Image
                src="/ethiohome-logo.png"
                alt="EthioHome Logo"
                width={150}
                height={38}
                className="h-8 w-auto object-contain dark:hidden"
              />
              {/* Dark Mode Logo */}
              <div className="hidden dark:flex items-center bg-white/95 px-2.5 py-1 rounded-xl shadow-xs">
                <Image
                  src="/ethiohome-logo.png"
                  alt="EthioHome Logo"
                  width={140}
                  height={35}
                  className="h-6 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              The premier Ethiopian home rental marketplace. Discover hand-picked luxury apartments, crater lake villas, and authentic guest homes across Addis Ababa, Bishoftu, Hawassa, and Bahir Dar.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1.5 font-medium text-green-600 dark:text-green-400">
                <Shield className="w-4 h-4" /> 100% Verified Properties
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium text-green-600 dark:text-green-400">
                <Sparkles className="w-4 h-4" /> Chapa & Telebirr Secured
              </span>
            </div>
          </div>

          {/* Ethiopian Destinations */}
          <div>
            <h4 className="font-semibold text-sm mb-4 tracking-wide uppercase text-foreground/80">
              Destinations
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/search?location=addis-ababa" className="hover:text-primary transition-colors">
                  Addis Ababa (Bole, CMC)
                </Link>
              </li>
              <li>
                <Link href="/search?location=bishoftu" className="hover:text-primary transition-colors">
                  Bishoftu Lake Villas
                </Link>
              </li>
              <li>
                <Link href="/search?location=hawassa" className="hover:text-primary transition-colors">
                  Hawassa Lakeside
                </Link>
              </li>
              <li>
                <Link href="/search?location=bahir-dar" className="hover:text-primary transition-colors">
                  Bahir Dar Lake Tana
                </Link>
              </li>
              <li>
                <Link href="/search?location=gondar" className="hover:text-primary transition-colors">
                  Gondar Heritage
                </Link>
              </li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h4 className="font-semibold text-sm mb-4 tracking-wide uppercase text-foreground/80">
              Hosting
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/owner/listings/new" className="hover:text-primary transition-colors">
                  List Your Property
                </Link>
              </li>
              <li>
                <Link href="/owner/wallet" className="hover:text-primary transition-colors">
                  Host Wallet & Earnings
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-primary transition-colors">
                  Host Protection Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Community Standards
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="font-semibold text-sm mb-4 tracking-wide uppercase text-foreground/80">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About EthioHome
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} EthioHome Inc. Built for Ethiopia with ❤️.</p>
          <div className="flex items-center gap-6">
            <span>ETB (Ethiopian Birr)</span>
            <span>English / አማርኛ</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
