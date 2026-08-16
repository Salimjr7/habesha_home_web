"use client";

import { useState } from "react";
import Image from "next/image";
import { Grid, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertyGalleryProps {
  images: Array<{
    id: string;
    url: string;
    alt?: string | null;
    isCover?: boolean;
  }>;
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayImages =
    images.length > 0
      ? images
      : [
          {
            id: "1",
            url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
            alt: "Main Living Room",
          },
          {
            id: "2",
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            alt: "Master Bedroom",
          },
          {
            id: "3",
            url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
            alt: "Kitchen & Dining",
          },
          {
            id: "4",
            url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
            alt: "Luxury Bathroom",
          },
        ];

  const mainImage = displayImages[0];
  const sideImages = displayImages.slice(1, 5);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setModalOpen(true);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <>
      <div className="relative grid grid-cols-1 md:grid-cols-4 gap-3 rounded-3xl overflow-hidden aspect-[16/10] md:aspect-[20/9] max-h-[500px]">
        {/* Main Photo (Takes half on desktop) */}
        <div
          className="relative md:col-span-2 h-full cursor-pointer overflow-hidden group"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={mainImage.url}
            alt={mainImage.alt || title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
        </div>

        {/* 4 Small Side Photos */}
        <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-3 h-full">
          {sideImages.map((img, idx) => (
            <div
              key={img.id || idx}
              className="relative h-full cursor-pointer overflow-hidden group"
              onClick={() => openLightbox(idx + 1)}
            >
              <Image
                src={img.url}
                alt={img.alt || `${title} photo ${idx + 2}`}
                fill
                sizes="25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            </div>
          ))}
        </div>

        {/* View All Photos Button */}
        <Button
          onClick={() => openLightbox(0)}
          variant="secondary"
          size="sm"
          className="absolute bottom-4 right-4 rounded-xl border border-border/80 shadow-md font-semibold text-xs flex items-center gap-2 backdrop-blur-md bg-background/90"
        >
          <Grid className="w-4 h-4" />
          Show all {displayImages.length} photos
        </Button>
      </div>

      {/* Lightbox Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white pb-4">
            <span className="text-sm font-semibold">
              {currentIndex + 1} / {displayImages.length} — {title}
            </span>
            <button
              onClick={() => setModalOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center">
            <button
              onClick={prevImage}
              className="absolute left-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="relative w-full h-full max-w-5xl max-h-[75vh]">
              <Image
                src={displayImages[currentIndex].url}
                alt={displayImages[currentIndex].alt || title}
                fill
                className="object-contain"
              />
            </div>

            <button
              onClick={nextImage}
              className="absolute right-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center text-xs text-neutral-400 pt-4">
            {displayImages[currentIndex].alt || "Property view"}
          </div>
        </div>
      )}
    </>
  );
}
