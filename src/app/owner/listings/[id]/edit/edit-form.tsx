"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePropertyAction } from "@/server/actions/property.actions";
import { Button } from "@/components/ui/button";
import {
  Building,
  Home,
  Sparkles,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Zap,
  Droplets,
  Wifi,
  ShieldCheck,
  Coffee,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { PropertyPhotoUpload, PropertyImageItem } from "@/components/property/property-photo-upload";

interface EditListingFormProps {
  property: {
    id: string;
    title: string;
    description: string;
    propertyType: "APARTMENT" | "HOUSE" | "VILLA" | "CONDO" | "STUDIO" | "PENTHOUSE" | "TOWNHOUSE" | "COTTAGE";
    listingType: "SHORT_TERM" | "LONG_TERM" | "BOTH";
    cityId: string;
    address: string;
    bedrooms: number;
    bathrooms: number;
    beds: number;
    maxGuests: number;
    pricePerNight: number;
    pricePerMonth: number;
    cleaningFee: number;
    weeklyDiscount: number;
    monthlyDiscount: number;
    amenityIds: string[];
    images?: PropertyImageItem[];
  };
}

export default function EditListingForm({ property }: EditListingFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<PropertyImageItem[]>(property.images || []);

  // Form State pre-populated with property details
  const [formData, setFormData] = useState({
    title: property.title || "",
    description: property.description || "",
    propertyType: property.propertyType || "APARTMENT",
    listingType: property.listingType || "SHORT_TERM",
    cityId: property.cityId || "addis-ababa",
    address: property.address || "",
    bedrooms: property.bedrooms ?? 2,
    bathrooms: property.bathrooms ?? 1,
    beds: property.beds ?? 2,
    maxGuests: property.maxGuests ?? 4,
    pricePerNight: property.pricePerNight || 5000,
    pricePerMonth: property.pricePerMonth || 75000,
    cleaningFee: property.cleaningFee ?? 500,
    weeklyDiscount: property.weeklyDiscount ?? 10,
    monthlyDiscount: property.monthlyDiscount ?? 20,
    amenityIds: property.amenityIds?.length
      ? property.amenityIds
      : ["backup-generator", "water-tank", "wifi", "security"],
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
      const finalTitle = formData.title.trim() || `Modern ${formData.propertyType} in Addis Ababa`;
      const finalAddress = formData.address.trim() || "Addis Ababa, Ethiopia";
      const finalDescription =
        formData.description.trim() ||
        `Authentic and fully equipped Ethiopian living space. Includes reliable continuous water reserve, standby generator backup, fiber Wi-Fi, and convenient access to local dining and transport.`;

      const res = await updatePropertyAction(property.id, {
        title: finalTitle,
        description: finalDescription,
        propertyType: formData.propertyType as any,
        listingType: formData.listingType as any,
        cityId: formData.cityId,
        address: finalAddress,
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
        images: images.map((img, idx) => ({
          url: img.url,
          isCover: img.isCover,
          order: idx,
        })),
      });

      if (!res.success) {
        toast.error(res.error.message || "Failed to update listing.");
        return;
      }

      toast.success("Listing updated successfully!");
      router.push("/owner/listings");
      router.refresh();
    } catch {
      toast.error("An error occurred while updating the listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Wizard Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span>Step {currentStep} of 5</span>
          <span>
            {currentStep === 1 && "Basic Information"}
            {currentStep === 2 && "Rooms & Capacity"}
            {currentStep === 3 && "Ethiopian Amenities"}
            {currentStep === 4 && "Property Photos"}
            {currentStep === 5 && "Pricing & Update"}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-600 to-emerald-500 transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
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
              <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                Edit Listing
              </span>
              <h2 className="text-2xl font-black text-foreground tracking-tight mt-1">
                Property Details
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Update the title, Ethiopian city location, and property type.
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
                Rooms &amp; Sleeping Arrangements
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Help travelers know how many guests can stay comfortably.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-border/80 bg-background/50 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Bedrooms
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bedrooms: Math.max(0, formData.bedrooms - 1) })}
                    className="w-8 h-8 rounded-lg bg-secondary text-foreground font-bold flex items-center justify-center hover:bg-secondary/80"
                  >
                    -
                  </button>
                  <span className="text-base font-bold w-6 text-center">{formData.bedrooms}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bedrooms: formData.bedrooms + 1 })}
                    className="w-8 h-8 rounded-lg bg-secondary text-foreground font-bold flex items-center justify-center hover:bg-secondary/80"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border/80 bg-background/50 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Bathrooms
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bathrooms: Math.max(1, formData.bathrooms - 1) })}
                    className="w-8 h-8 rounded-lg bg-secondary text-foreground font-bold flex items-center justify-center hover:bg-secondary/80"
                  >
                    -
                  </button>
                  <span className="text-base font-bold w-6 text-center">{formData.bathrooms}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bathrooms: formData.bathrooms + 1 })}
                    className="w-8 h-8 rounded-lg bg-secondary text-foreground font-bold flex items-center justify-center hover:bg-secondary/80"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border/80 bg-background/50 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Beds
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, beds: Math.max(1, formData.beds - 1) })}
                    className="w-8 h-8 rounded-lg bg-secondary text-foreground font-bold flex items-center justify-center hover:bg-secondary/80"
                  >
                    -
                  </button>
                  <span className="text-base font-bold w-6 text-center">{formData.beds}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, beds: formData.beds + 1 })}
                    className="w-8 h-8 rounded-lg bg-secondary text-foreground font-bold flex items-center justify-center hover:bg-secondary/80"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border/80 bg-background/50 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Max Guests
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, maxGuests: Math.max(1, formData.maxGuests - 1) })}
                    className="w-8 h-8 rounded-lg bg-secondary text-foreground font-bold flex items-center justify-center hover:bg-secondary/80"
                  >
                    -
                  </button>
                  <span className="text-base font-bold w-6 text-center">{formData.maxGuests}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, maxGuests: formData.maxGuests + 1 })}
                    className="w-8 h-8 rounded-lg bg-secondary text-foreground font-bold flex items-center justify-center hover:bg-secondary/80"
                  >
                    +
                  </button>
                </div>
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
                Ethiopian Home Amenities
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Highlighting backup generator and continuous water reserve makes listings 3x more popular.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {amenitiesList.map((amenity) => {
                const Icon = amenity.icon;
                const isSelected = formData.amenityIds.includes(amenity.id);
                return (
                  <div
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3.5 transition-all ${
                      isSelected
                        ? "border-green-500 bg-green-500/5 text-foreground shadow-xs"
                        : "border-border/70 hover:border-border text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-green-500 text-white"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold flex-1">{amenity.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: Property Photos */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                Update Property Photos
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Upload new photos or manage existing photos. The first photo will be used as the cover.
              </p>
            </div>

            <PropertyPhotoUpload images={images} onChange={setImages} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: Pricing */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                Adjust Your Pricing (ETB)
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Set your nightly rate in Ethiopian Birr. You receive net payout directly to your bank or telebirr.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-green-500/30 bg-green-500/5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Price Per Night (ETB)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 font-black text-base text-foreground">ETB</span>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-14 pl-16 pr-4 rounded-xl border border-input bg-card text-2xl font-black focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Cleaning Fee (ETB)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={formData.cleaningFee}
                    onChange={(e) => setFormData({ ...formData, cleaningFee: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-10 px-3 rounded-xl border border-input text-sm font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
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

          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="font-bold bg-primary text-primary-foreground rounded-xl"
            >
              Next Step <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="font-bold bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl shadow-lg shadow-green-500/25"
            >
              {isSubmitting ? "Saving Changes..." : "Save & Update Listing"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
