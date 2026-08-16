import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Zap,
  Droplets,
  CreditCard,
  Building,
  Sparkles,
  ArrowRight,
  MapPin,
  Coffee,
  CheckCircle2,
} from "lucide-react";
import { PropertySearch } from "@/components/property/property-search";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch featured properties & cities from database with graceful fallback
  let featuredProperties: any[] = [];
  let featuredCities: any[] = [];

  try {
    featuredProperties = await prisma.property.findMany({
      where: { featured: true, status: "PUBLISHED" },
      take: 6,
      include: {
        city: true,
        images: { orderBy: [{ isCover: "desc" }, { order: "asc" }] },
      },
      orderBy: { avgRating: "desc" },
    });

    featuredCities = await prisma.city.findMany({
      where: { featured: true },
      include: {
        _count: {
          select: { properties: { where: { status: "PUBLISHED" } } },
        },
      },
      take: 4,
    });
  } catch {
    // Graceful fallback for initial zero-data state before migration/seed
  }

  // Fallback demo properties if DB is empty before seeding
  const displayProperties =
    featuredProperties.length > 0
      ? featuredProperties
      : [
          {
            id: "1",
            slug: "bole-atlas-executive-penthouse",
            title: "Bole Atlas Executive Penthouse with Panoramic City Views",
            propertyType: "PENTHOUSE",
            address: "Bole Atlas, behind Edna Mall, Addis Ababa",
            pricePerNight: 850000,
            avgRating: 4.95,
            reviewCount: 28,
            verified: true,
            instantBooking: true,
            city: { name: "Addis Ababa", slug: "addis-ababa" },
            images: [
              {
                url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
                isCover: true,
              },
            ],
          },
          {
            id: "2",
            slug: "lake-babogaya-waterfront-villa",
            title: "Lake Babogaya Luxury Waterfront Villa with Private Pier",
            propertyType: "VILLA",
            address: "Lake Babogaya shoreline, Bishoftu",
            pricePerNight: 1200000,
            avgRating: 4.98,
            reviewCount: 34,
            verified: true,
            instantBooking: true,
            city: { name: "Bishoftu", slug: "bishoftu" },
            images: [
              {
                url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
                isCover: true,
              },
            ],
          },
          {
            id: "3",
            slug: "kazanchis-un-hub-studio",
            title: "Kazanchis UN-Hub Modern Studio for Business Travelers",
            propertyType: "STUDIO",
            address: "Kazanchis, Guinea Conakry St, Addis Ababa",
            pricePerNight: 420000,
            avgRating: 4.88,
            reviewCount: 42,
            verified: true,
            instantBooking: true,
            city: { name: "Addis Ababa", slug: "addis-ababa" },
            images: [
              {
                url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
                isCover: true,
              },
            ],
          },
        ];

  const categories = [
    { title: "Apartments", icon: Building, desc: "Modern urban flats in Bole & Kazanchis", slug: "APARTMENT" },
    { title: "Lakeside Villas", icon: Sparkles, desc: "Waterfront retreats in Bishoftu & Hawassa", slug: "VILLA" },
    { title: "Family Houses", icon: CheckCircle2, desc: "Spacious gated compounds in CMC & Summit", slug: "HOUSE" },
    { title: "Business Studios", icon: Coffee, desc: "Workstation-ready lofts near diplomatic hubs", slug: "STUDIO" },
  ];

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative min-h-[580px] flex items-center justify-center pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Image with Ambient Ethiopian Warm Gradient */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
            alt="Habesha Home Luxury Interior"
            fill
            priority
            className="object-cover object-center filter brightness-[0.38] contrast-[1.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 backdrop-blur-md text-xs font-semibold tracking-wide uppercase shadow-lg shadow-amber-500/10 animate-in fade-in zoom-in-95 duration-500">
            <Sparkles className="w-3.5 h-3.5" />
            Find a place that feels like home
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Ethiopia&apos;s Premier <br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              Home Rental Experience
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-200 font-normal leading-relaxed">
            Verified luxury apartments, crater lake villas, and serene family homes with guaranteed backup generator, constant water supply, and seamless Chapa &amp; telebirr checkout.
          </p>

          {/* Interactive Search Bar Widget */}
          <div className="pt-4">
            <PropertySearch />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CATEGORIES OVERVIEW */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Curated by Property Type
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Find exactly what suits your lifestyle and travel needs across Ethiopia
            </p>
          </div>
          <Link href="/search" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
            Browse all types <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/search?propertyType=${cat.slug}`}
                className="group relative flex flex-col p-6 rounded-3xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {cat.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. POPULAR ETHIOPIAN DESTINATIONS */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Popular Cities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
              Explore Ethiopia&apos;s Top Getaways
            </h2>
          </div>
          <Link href="/search" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
            See all destinations <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(featuredCities.length > 0
            ? featuredCities
            : [
                {
                  name: "Addis Ababa",
                  slug: "addis-ababa",
                  description: "Diplomatic heart with Bole & Kazanchis luxury towers",
                  image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
                },
                {
                  name: "Bishoftu",
                  slug: "bishoftu",
                  description: "Crater lake villas & scenic weekend retreats",
                  image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
                },
                {
                  name: "Hawassa",
                  slug: "hawassa",
                  description: "Lakeside palms, sunset views & fish market",
                  image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
                },
                {
                  name: "Bahir Dar",
                  slug: "bahir-dar",
                  description: "Lake Tana shorelines & Blue Nile Falls",
                  image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80",
                },
              ]
          ).map((city) => (
            <Link
              key={city.slug}
              href={`/search?location=${city.slug}`}
              className="group relative aspect-[4/5] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
            >
              <Image
                src={city.image || "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80"}
                alt={city.name}
                fill
                className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  Ethiopia
                </div>
                <h3 className="text-2xl font-bold tracking-tight">{city.name}</h3>
                <p className="text-xs text-neutral-300 line-clamp-2">{city.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FEATURED PROPERTIES SECTION */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Verified Stays
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
              Featured Habesha Homes
            </h2>
          </div>
          <Link href="/search">
            <Button variant="outline" className="rounded-xl border-border/80">
              Explore All 30+ Listings
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {displayProperties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TRUST & THE ETHIOPIAN LIVING STANDARD */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-amber-500/5 via-card to-amber-500/10 p-8 sm:p-14 overflow-hidden relative">
          <div className="max-w-3xl space-y-4 mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-4 h-4" /> Habesha Home Guarantee
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Hospitality Designed for the Ethiopian Reality
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              We know what matters when renting in Ethiopia. Every verified home meets our strict infrastructure checklist.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">24/7 Power Assurance</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automatic standby generator or solar backup system so you never experience power cuts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Continuous Water Tanks</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                High-capacity reservoir tanks and booster pumps ensuring continuous clean running water.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Chapa &amp; telebirr Payments</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pay in Ethiopian Birr with any local bank card, CBEBirr, or direct telebirr mobile money.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">100% In-Person Verified</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every listing is physically inspected and photos verified by our local Ethiopian team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. HOST CALL TO ACTION */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 text-white p-8 sm:p-14 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Host on Habesha Home
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Turn your property into monthly income
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Join hundreds of hosts in Addis Ababa and Bishoftu earning steady rental income with guaranteed payouts directly to your Ethiopian bank account or telebirr wallet.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
            <Link href="/owner/listings/new">
              <Button size="lg" className="w-full sm:w-auto font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/20">
                List Your Home Now
              </Button>
            </Link>
            <Link href="/help">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-neutral-700 text-white hover:bg-neutral-800">
                Learn How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
