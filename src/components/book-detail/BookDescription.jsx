import React from 'react';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const BookDescription = React.memo(({ description, previewLength = 800 }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const shouldTruncate = description.length > previewLength;
  const displayText = showFullDescription || !shouldTruncate
    ? description
    : description.substring(0, previewLength) + '...';

  // Điều kiện để kích hoạt hiệu ứng fade mờ
  const isFaded = shouldTruncate && !showFullDescription;

  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Giới thiệu sách
      </h2>
      
      {/* Container của đoạn text */}
      <div 
        className={`text-sm text-gray-600 dark:text-gray-300 leading-7 text-justify whitespace-pre-line transition-all duration-300
          ${isFaded ? '[mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]' : ''}
        `}
      >
        {displayText}
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