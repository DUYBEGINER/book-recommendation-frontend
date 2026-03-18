import React from 'react';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const BookDescription = React.memo(({ description, previewLength = 800 }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const shouldTruncate = description.length > previewLength;
  const displayText = showFullDescription || !shouldTruncate
    ? description
    : description.substring(0, previewLength) + '...';

  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Giới thiệu sách</h2>
      <div className="relative">
        <div className="text-sm text-gray-600 dark:text-gray-300 leading-7 text-justify whitespace-pre-line">
          {displayText}
        </div>
        {shouldTruncate && !showFullDescription && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent pointer-events-none" />
        )}
      </div>
      {shouldTruncate && (
        <button
          onClick={() => setShowFullDescription(!showFullDescription)}
          className="mt-3 text-sm text-primary hover:text-primary-hover dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors duration-200 inline-flex items-center gap-1"
        >
          {showFullDescription ? (
            <>Thu gọn <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Xem thêm <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}
    </div>
  );
});

BookDescription.displayName = 'BookDescription';
export default BookDescription;