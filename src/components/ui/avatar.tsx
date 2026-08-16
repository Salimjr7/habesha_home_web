"use client";

import * as React from "react";
import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Avatar({ src, alt, name, size = "md", className, ...props }: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-20 w-20 text-xl",
  };

  const [imageError, setImageError] = React.useState(false);

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border border-border bg-secondary font-medium text-secondary-foreground items-center justify-center shadow-xs",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={alt || name || "User Avatar"}
          fill
          className="aspect-square h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{name ? getInitials(name) : "?"}</span>
      )}
    </div>
  );
}
