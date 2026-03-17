import React from 'react';

const BookCover = React.memo(({ src, alt, className = '' }) => {
  return (
    <div className="w-full flex justify-center lg:block">
      <div className="relative group perspective-1000">
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <img
          src={src}
          alt={alt}
          className={`relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-full h-auto rounded-lg shadow-2xl transform transition-transform duration-500 group-hover:scale-[1.02] ${className}`}
          style={{ maxHeight: '600px', objectFit: 'cover' }}
        />
      </div>
    </div>
  );
});



BookCover.displayName = 'BookCover';
export default BookCover;

