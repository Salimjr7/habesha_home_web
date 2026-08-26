"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar as CalendarIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PropertySearch() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (location.trim()) params.set("location", location.trim());
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (parseInt(guests, 10) > 1) params.set("guests", guests);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-4xl mx-auto rounded-3xl border border-border/80 bg-white/95 dark:bg-card/95 p-3 shadow-2xl shadow-black/15 dark:shadow-primary/10 backdrop-blur-xl transition-all"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-border/60">
        {/* Where Input */}
        <div className="p-3 px-4 flex flex-col justify-center rounded-2xl hover:bg-neutral-100/80 dark:hover:bg-secondary/40 transition-colors">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-muted-foreground flex items-center gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            Where
          </label>
          <input
            type="text"
            placeholder="Addis Ababa, Bishoftu, Bole..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-neutral-900 dark:text-foreground placeholder:text-neutral-400 dark:placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>

        {/* Check In */}
        <div className="p-3 px-4 flex flex-col justify-center rounded-2xl hover:bg-neutral-100/80 dark:hover:bg-secondary/40 transition-colors">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-muted-foreground flex items-center gap-1.5 mb-1">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-neutral-900 dark:text-foreground focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>

        {/* Check Out */}
        <div className="p-3 px-4 flex flex-col justify-center rounded-2xl hover:bg-neutral-100/80 dark:hover:bg-secondary/40 transition-colors">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-muted-foreground flex items-center gap-1.5 mb-1">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
            Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-neutral-900 dark:text-foreground focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>

        {/* Guests & Search Button */}
        <div className="p-3 px-4 flex items-center justify-between gap-3 rounded-2xl hover:bg-neutral-100/80 dark:hover:bg-secondary/40 transition-colors">
          <div className="flex flex-col justify-center">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-muted-foreground flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-amber-500" />
              Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="bg-transparent text-sm font-semibold text-neutral-900 dark:text-foreground focus:outline-none cursor-pointer"
            >
              <option value="1" className="bg-white dark:bg-card text-neutral-900 dark:text-foreground">1 guest</option>
              <option value="2" className="bg-white dark:bg-card text-neutral-900 dark:text-foreground">2 guests</option>
              <option value="4" className="bg-white dark:bg-card text-neutral-900 dark:text-foreground">4 guests</option>
              <option value="6" className="bg-white dark:bg-card text-neutral-900 dark:text-foreground">6+ guests</option>
            </select>
          </div>

          <Button
            type="submit"
            size="icon"
            className="w-12 h-12 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all shrink-0"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </form>
  );
}
