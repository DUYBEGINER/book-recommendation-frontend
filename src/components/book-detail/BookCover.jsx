import React from 'react';

const BookCover = React.memo(({ src, alt, className = '' }) => {
  return (
    <div className="flex-shrink-0 w-full max-w-[220px] sm:max-w-[260px] lg:max-w-[280px] mx-auto lg:mx-0">
      <div className="sticky top-18">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          <img
            src={src}
            alt={alt}
            className={`relative w-full rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 transition-transform duration-500 group-hover:scale-[1.02] ${className}`}
          />
        </div>
      </div>
    </div>
  );
});

BookCover.displayName = 'BookCover';
export default BookCover;

