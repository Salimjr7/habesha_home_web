"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPropertyAction } from "@/server/actions/property.actions";
import { Button } from "@/components/ui/button";
import {
  Building,
  Home,
  Sparkles,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Zap,
  Droplets,
  Wifi,
  ShieldCheck,
  Coffee,
} from "lucide-react";
import { toast } from "sonner";

export default function NewListingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "APARTMENT" as const,
    listingType: "SHORT_TERM" as const,
    cityId: "addis-ababa",
    address: "",
    bedrooms: 2,
    bathrooms: 2,
    beds: 2,
    maxGuests: 4,
    pricePerNight: 5500, // In ETB
    pricePerMonth: 85000,
    cleaningFee: 500,
    weeklyDiscount: 10,
    monthlyDiscount: 25,
    amenityIds: ["backup-generator", "water-tank", "wifi", "security", "coffee-ceremony"],
  });

  const propertyTypes = [
    { label: "Apartment", value: "APARTMENT", icon: Building },
    { label: "Villa / Retreat", value: "VILLA", icon: Sparkles },
    { label: "Family House", value: "HOUSE", icon: Home },
    { label: "Condo", value: "CONDO", icon: Building },
    { label: "Studio", value: "STUDIO", icon: Building },
    { label: "Penthouse", value: "PENTHOUSE", icon: Sparkles },
  ];

  const amenitiesList = [
    { id: "backup-generator", name: "24/7 Standby Generator", icon: Zap },
    { id: "water-tank", name: "Continuous Water Tank", icon: Droplets },
    { id: "wifi", name: "High-Speed Fiber Wi-Fi", icon: Wifi },
    { id: "security", name: "24/7 Gated Security", icon: ShieldCheck },
    { id: "coffee-ceremony", name: "Traditional Coffee Ceremony Set", icon: Coffee },
    { id: "kitchen", name: "Fully Equipped Kitchen", icon: Home },
    { id: "parking", name: "Free Dedicated Parking", icon: Building },
    { id: "smart-tv", name: "Smart TV with DSTV & Canal+", icon: Sparkles },
  ];

  const toggleAmenity = (id: string) => {
    if (formData.amenityIds.includes(id)) {
      setFormData({
        ...formData,
        amenityIds: formData.amenityIds.filter((item) => item !== id),
      });
    } else {
      setFormData({
        ...formData,
        amenityIds: [...formData.amenityIds, id],
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await createPropertyAction({
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        cityId: formData.cityId,
        address: formData.address,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        beds: Number(formData.beds),
        maxGuests: Number(formData.maxGuests),
        pricePerNight: Number(formData.pricePerNight),
        pricePerMonth: formData.pricePerMonth ? Number(formData.pricePerMonth) : undefined,
        cleaningFee: Number(formData.cleaningFee),
        weeklyDiscount: Number(formData.weeklyDiscount),
        monthlyDiscount: Number(formData.monthlyDiscount),
        amenityIds: formData.amenityIds,
      });

      if (!res.success) {
        toast.error(res.error.message || "Failed to publish listing.");
        return;
      }

      toast.success("Listing published successfully!");
      router.push("/owner/listings");
    } catch {
      toast.error("An error occurred while publishing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Wizard Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span>Step {currentStep} of 4</span>
          <span>
            {currentStep === 1 && "Basic Information"}
            {currentStep === 2 && "Rooms & Capacity"}
            {currentStep === 3 && "Ethiopian Amenities"}
            {currentStep === 4 && "Pricing & Publish"}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl border border-border/80 bg-card shadow-xl space-y-8">
        {/* ========================================================================= */}
        {/* STEP 1: Basic Information */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                Tell us about your place
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Start with the property title, Ethiopian city location, and property type.
              </p>
            </div>

            {/* Property Type Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Property Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {propertyTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.propertyType === type.value;
                  return (
                    <div
                      key={type.value}
                      onClick={() => setFormData({ ...formData, propertyType: type.value as any })}
                      className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col items-center gap-2 text-center transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 text-primary shadow-xs"
                          : "border-border/80 hover:border-border text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-bold">{type.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Listing Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Bole Atlas Modern 2-Bedroom Luxury Suite"
                className="w-full h-11 px-4 rounded-xl border border-input bg-background/60 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Location City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Ethiopian City
                </label>
                <select
                  value={formData.cityId}
                  onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background/60 text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="addis-ababa" className="bg-card text-foreground">Addis Ababa</option>
                  <option value="bishoftu" className="bg-card text-foreground">Bishoftu (Debre Zeyit)</option>
                  <option value="hawassa" className="bg-card text-foreground">Hawassa</option>
                  <option value="bahir-dar" className="bg-card text-foreground">Bahir Dar</option>
                  <option value="gondar" className="bg-card text-foreground">Gondar</option>
                  <option value="dire-dawa" className="bg-card text-foreground">Dire Dawa</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Specific Address / Area
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Bole Atlas, Near Edna Mall"
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background/60 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your space, views, proximity to local cafes/restaurants, backup generator, water storage, and comfort details..."
                className="w-full p-4 rounded-xl border border-input bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: Capacity & Rooms */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                Guest Capacity &amp; Rooms
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Specify how many guests and rooms your space accommodates.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-border/80 space-y-2">
                <span className="text-xs font-bold uppercase text-muted-foreground">Max Guests</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={formData.maxGuests}
                  onChange={(e) => setFormData({ ...formData, maxGuests: parseInt(e.target.value, 10) || 1 })}
                  className="w-full h-10 px-3 rounded-lg border border-input text-base font-bold"
                />
              </div>

              <div className="p-4 rounded-2xl border border-border/80 space-y-2">
                <span className="text-xs font-bold uppercase text-muted-foreground">Bedrooms</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value, 10) || 1 })}
                  className="w-full h-10 px-3 rounded-lg border border-input text-base font-bold"
                />
              </div>

              <div className="p-4 rounded-2xl border border-border/80 space-y-2">
                <span className="text-xs font-bold uppercase text-muted-foreground">Beds</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={formData.beds}
                  onChange={(e) => setFormData({ ...formData, beds: parseInt(e.target.value, 10) || 1 })}
                  className="w-full h-10 px-3 rounded-lg border border-input text-base font-bold"
                />
              </div>

              <div className="p-4 rounded-2xl border border-border/80 space-y-2">
                <span className="text-xs font-bold uppercase text-muted-foreground">Bathrooms</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value, 10) || 1 })}
                  className="w-full h-10 px-3 rounded-lg border border-input text-base font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: Amenities */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                Ethiopian Living Checklist
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select amenities provided. Standby generator and water reserve are highlighted to guests.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {amenitiesList.map((item) => {
                const Icon = item.icon;
                const isSelected = formData.amenityIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleAmenity(item.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 text-foreground shadow-xs"
                        : "border-border/80 hover:border-border text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold">{item.name}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: Pricing */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                Set Your Pricing (ETB)
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Set your nightly rate in Ethiopian Birr. You receive net payout directly to your bank or telebirr.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl border border-primary/40 bg-primary/5 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Price Per Night (ETB)
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-foreground">ETB</span>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-12 px-4 rounded-xl border border-input text-xl font-black text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Cleaning Fee (ETB)
                  </label>
                  <input
                    type="number"
                    value={formData.cleaningFee}
                    onChange={(e) => setFormData({ ...formData, cleaningFee: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-10 px-3 rounded-xl border border-input text-sm font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Weekly Stay Discount (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={formData.weeklyDiscount}
                    onChange={(e) => setFormData({ ...formData, weeklyDiscount: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-10 px-3 rounded-xl border border-input text-sm font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-border/60">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={() => {
                if (currentStep === 1 && !formData.title.trim()) {
                  toast.error("Please enter a title for your property.");
                  return;
                }
                setCurrentStep(currentStep + 1);
              }}
              className="font-bold bg-primary text-primary-foreground rounded-xl"
            >
              Next Step <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl shadow-lg shadow-amber-500/25"
            >
              {isSubmitting ? "Publishing Home..." : "Publish Ethiopian Home"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
