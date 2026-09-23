import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { Toaster } from "sonner";

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
    icon: "/ethiohome-logo.png",
    apple: "/ethiohome-logo.png",
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
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
