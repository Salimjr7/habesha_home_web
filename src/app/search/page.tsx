import { PropertyService } from "@/server/services/property.service";
import { PropertyCard } from "@/components/property/property-card";
import { Search, SlidersHorizontal, MapPin, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    minPrice?: string;
    maxPrice?: string;
    propertyType?: string;
    bedrooms?: string;
    bathrooms?: string;
    amenities?: string;
    sort?: "recommended" | "price_asc" | "price_desc" | "rating" | "newest";
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  const location = params.location || "";
  const propertyType = params.propertyType || "";
  const minPrice = params.minPrice ? parseInt(params.minPrice, 10) : undefined;
  const maxPrice = params.maxPrice ? parseInt(params.maxPrice, 10) : undefined;
  const guests = params.guests ? parseInt(params.guests, 10) : undefined;
  const bedrooms = params.bedrooms ? parseInt(params.bedrooms, 10) : undefined;
  const sort = params.sort || "recommended";
  const page = params.page ? parseInt(params.page, 10) : 1;

  let properties: any[] = [];
  let totalCount = 0;
  let totalPages = 1;

  try {
    const res = await PropertyService.searchProperties({
      location,
      propertyType: propertyType || undefined,
      minPrice,
      maxPrice,
      guests,
      bedrooms,
      sort,
      page,
      limit: 12,
    });
    properties = res.properties;
    totalCount = res.pagination.total;
    totalPages = res.pagination.totalPages;
  } catch {
    // Graceful fallback for initial zero-data state
  }

  const propertyTypes = [
    { label: "All Types", value: "" },
    { label: "Apartments", value: "APARTMENT" },
    { label: "Villas", value: "VILLA" },
    { label: "Houses", value: "HOUSE" },
    { label: "Condos", value: "CONDO" },
    { label: "Studios", value: "STUDIO" },
    { label: "Penthouses", value: "PENTHOUSE" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Search Bar & Active Filters Bar */}
      <div className="flex flex-col gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Explore Ethiopian Stays
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {properties.length > 0 ? `${totalCount} verified homes` : "0 properties found"}
            {location && ` in "${location}"`}
          </p>
        </div>

        {/* Quick Filter Horizontal Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {propertyTypes.map((type) => {
            const isActive = propertyType === type.value;
            const newParams = new URLSearchParams(params as Record<string, string>);
            if (type.value) {
              newParams.set("propertyType", type.value);
            } else {
              newParams.delete("propertyType");
            }

            return (
              <Link
                key={type.label}
                href={`/search?${newParams.toString()}`}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                {type.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ========================================================================= */}
        {/* FILTERS SIDEBAR */}
        {/* ========================================================================= */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <form method="GET" action="/search" className="p-6 rounded-3xl border border-border/70 bg-card space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <span className="font-bold text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                Filters
              </span>
              {(location || propertyType || minPrice || maxPrice || bedrooms) && (
                <Link href="/search" className="text-xs text-amber-600 dark:text-amber-400 hover:underline">
                  Reset all
                </Link>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Location / City
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
                <input
                  type="text"
                  name="location"
                  defaultValue={location}
                  placeholder="e.g. Bole, Bishoftu"
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Price Range (ETB) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Price per night (ETB)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="minPrice"
                  defaultValue={minPrice}
                  placeholder="Min ETB"
                  className="h-10 px-3 rounded-xl border border-input bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  name="maxPrice"
                  defaultValue={maxPrice}
                  placeholder="Max ETB"
                  className="h-10 px-3 rounded-xl border border-input bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Bedrooms
              </label>
              <select
                name="bedrooms"
                defaultValue={bedrooms || ""}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Any number</option>
                <option value="1">1+ Bedrooms</option>
                <option value="2">2+ Bedrooms</option>
                <option value="3">3+ Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Sort By
              </label>
              <select
                name="sort"
                defaultValue={sort}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="recommended">Recommended &amp; Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Listings</option>
              </select>
            </div>

            <Button type="submit" className="w-full font-semibold">
              Apply Filters
            </Button>
          </form>
        </aside>

        {/* ========================================================================= */}
        {/* PROPERTY RESULTS GRID */}
        {/* ========================================================================= */}
        <main className="lg:col-span-3 space-y-8">
          {properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const pageParams = new URLSearchParams(params as Record<string, string>);
                    pageParams.set("page", p.toString());
                    return (
                      <Link
                        key={p}
                        href={`/search?${pageParams.toString()}`}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold border ${
                          p === page
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border/80 hover:bg-secondary"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center rounded-3xl border border-border/80 bg-card space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold">No properties match your search</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Try widening your price range, searching for another Ethiopian city (e.g. Addis Ababa or Bishoftu), or clearing applied filters.
              </p>
              <Link href="/search">
                <Button variant="outline" className="mt-2">
                  Clear All Filters
                </Button>
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
