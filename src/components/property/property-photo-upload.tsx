"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X, Star, Link as LinkIcon, Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface PropertyImageItem {
  url: string;
  isCover: boolean;
  order: number;
}

interface PropertyPhotoUploadProps {
  images: PropertyImageItem[];
  onChange: (images: PropertyImageItem[]) => void;
}

export function PropertyPhotoUpload({ images, onChange }: PropertyPhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlField, setShowUrlField] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload photos");
      }

      const newUrls: string[] = data.urls || [data.url];
      const newItems: PropertyImageItem[] = newUrls.map((url, index) => ({
        url,
        isCover: images.length === 0 && index === 0,
        order: images.length + index,
      }));

      onChange([...images, ...newItems]);
      toast.success(`${newUrls.length} photo${newUrls.length > 1 ? "s" : ""} uploaded successfully!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error uploading files";
      toast.error(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
      toast.error("Please enter a valid image URL (starting with http://, https://, or /)");
      return;
    }

    const newItem: PropertyImageItem = {
      url: trimmed,
      isCover: images.length === 0,
      order: images.length,
    };

    onChange([...images, newItem]);
    setUrlInput("");
    setShowUrlField(false);
    toast.success("Photo URL added!");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    // If we removed the cover image, make the first remaining image cover
    if (updated.length > 0 && !updated.some((img) => img.isCover)) {
      updated[0].isCover = true;
    }
    // Re-index orders
    const reordered = updated.map((img, idx) => ({ ...img, order: idx }));
    onChange(reordered);
    toast.info("Photo removed");
  };

  const handleSetCover = (coverIndex: number) => {
    const updated = images.map((img, idx) => ({
      ...img,
      isCover: idx === coverIndex,
    }));
    onChange(updated);
    toast.success("Cover photo updated!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ImagePlus className="w-5 h-5 text-primary" />
            Property Photos ({images.length})
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload clear, high-resolution photos of your property. The first photo will be used as the cover.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowUrlField(!showUrlField)}
          className="text-xs self-start sm:self-auto"
        >
          <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
          {showUrlField ? "Hide URL Input" : "Add by Image URL"}
        </Button>
      </div>

      {/* URL Add Box */}
      {showUrlField && (
        <form onSubmit={handleAddUrl} className="flex gap-2 p-4 rounded-2xl bg-secondary/40 border border-border/70">
          <input
            type="text"
            placeholder="Paste image URL (e.g. https://example.com/photo.jpg)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl text-sm border border-border/80 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <Button type="submit" size="sm" className="font-semibold">
            Add Photo
          </Button>
        </form>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer ${
          isUploading
            ? "border-primary/50 bg-primary/5 pointer-events-none"
            : "border-border/80 hover:border-primary/60 hover:bg-primary/5 bg-card/60"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <UploadCloud className="w-8 h-8" />
          )}
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-foreground">
            {isUploading ? "Uploading photos to EthioHome..." : "Click to select or drag & drop photos here"}
          </p>
          <p className="text-xs text-muted-foreground">
            Supports JPG, PNG, and WebP (up to 10MB each). You can select multiple photos at once.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-4 pointer-events-none text-xs font-semibold"
        >
          {isUploading ? "Uploading..." : "Browse Local Files"}
        </Button>
      </div>

      {/* Image Previews Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Uploaded Gallery ({images.length} photos)</span>
            <span className="text-primary font-medium">★ = Current Cover Photo</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div
                key={`${img.url}-${index}`}
                className={`group relative rounded-2xl overflow-hidden border transition-all ${
                  img.isCover
                    ? "border-primary ring-2 ring-primary/30 shadow-md"
                    : "border-border/80 hover:border-primary/50"
                }`}
              >
                <div className="relative aspect-4/3 w-full bg-secondary/50">
                  <Image
                    src={img.url}
                    alt={`Property photo ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>

                {/* Cover badge */}
                {img.isCover && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground shadow-xs flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Cover
                  </span>
                )}

                {/* Actions overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  {!img.isCover && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetCover(index);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/90 text-neutral-900 hover:bg-white shadow-xs"
                      title="Set as Cover Photo"
                    >
                      Make Cover
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    className="w-8 h-8 rounded-lg bg-red-600/90 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-xs"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
