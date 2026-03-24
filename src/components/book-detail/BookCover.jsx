import React, { useState, useEffect } from "react";
import {
  optimizeCloudinaryUrl,
  generateSrcSet,
  getPlaceholderUrl,
  isCloudinaryUrl,
  CLOUDINARY_PRESETS,
} from "../../utils/cloudinaryUtils";

const BookCover = React.memo(({ src, alt, className = "" }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState("");

  // Generate optimized URLs
  const optimizedSrc = isCloudinaryUrl(src)
    ? optimizeCloudinaryUrl(src, CLOUDINARY_PRESETS.bookCover)
    : src;

  const placeholderSrc = isCloudinaryUrl(src) ? getPlaceholderUrl(src, 30) : "";

  const srcSet = isCloudinaryUrl(src)
    ? generateSrcSet(src, [160, 220, 280, 400, 560])
    : "";

  // Preload placeholder, then main image
  useEffect(() => {
    if (!src) return;

    // Show placeholder immediately if available
    if (placeholderSrc) {
      setCurrentSrc(placeholderSrc);
    }

    // Load optimized image
    const img = new Image();
    img.src = optimizedSrc;
    img.onload = () => {
      setCurrentSrc(optimizedSrc);
      setIsLoaded(true);
    };
    img.onerror = () => {
      // Fallback to original if optimization fails
      setCurrentSrc(src);
      setIsLoaded(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, optimizedSrc, placeholderSrc]);

  return (
    <div className="flex-shrink-0 mt-20 lg:mt-0 w-full max-w-[160px] sm:max-w-[220px] lg:max-w-[280px] mx-auto lg:mx-0">
      <div className="sticky top-18">
        <div className="relative group">
          <div className="hidden md:block absolute -inset-1 bg-gradient-to-br from-primary/30 to-primary/10 rounded-xl sm:rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          <img
            src={currentSrc || placeholderSrc || src}
            srcSet={isLoaded && srcSet ? srcSet : undefined}
            sizes={isLoaded && srcSet ? "(max-width: 640px) 160px, (max-width: 1024px) 220px, 280px" : undefined}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={`relative w-full rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl ring-1 ring-black/5 dark:ring-white/10 transition-all duration-500 group-hover:scale-[1.02] ${
              isLoaded ? "blur-0" : "blur-sm"
            } ${className}`}
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      </div>
    </div>
  );
});

BookCover.displayName = "BookCover";
export default BookCover;
