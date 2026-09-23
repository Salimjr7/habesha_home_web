import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { CapacitorProvider } from "@/components/shared/capacitor-provider";
import { RealtimeProvider } from "@/components/shared/realtime-provider";
import { Toaster } from "sonner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b132b" },
  ],
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "EthioHome — Premium Ethiopian Home Rental Marketplace",
    template: "%s | EthioHome",
  },
  description:
    "Discover, book, and enjoy verified homes, luxury apartments, and lakefront villas across Ethiopia. Pay seamlessly with Chapa and Telebirr.",
  keywords: [
    "Ethiopia rentals",
    "Addis Ababa apartments",
    "Bishoftu villas",
    "Hawassa guest houses",
    "EthioHome",
    "Telebirr booking",
    "Chapa payment",
  ],
  authors: [{ name: "EthioHome Team" }],
  creator: "EthioHome",
  openGraph: {
    type: "website",
    locale: "en_ET",
    url: "https://ethiohome.et",
    siteName: "EthioHome",
    title: "EthioHome — Find a place that feels like home in Ethiopia",
    description:
      "The premier home rental marketplace for Ethiopia. Verified properties, backup power & water assurance, and instant local payments.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CapacitorProvider>
            <RealtimeProvider>
              <Header />
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
              <Footer />
              <MobileBottomNav />
              <Toaster position="top-right" richColors closeButton />
            </RealtimeProvider>
          </CapacitorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
