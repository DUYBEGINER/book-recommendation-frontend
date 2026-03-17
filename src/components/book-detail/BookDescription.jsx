import React from 'react';
import { useState } from 'react';

const BookDescription = React.memo(({ description, previewLength = 800 }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Guard clause for empty descriptions to prevent errors
  if (!description) return null;

  const shouldTruncate = description.length > previewLength;
  const displayText = showFullDescription || !shouldTruncate
    ? description
    : description.substring(0, previewLength) + '...';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 mb-8 border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
         <span className="w-1.5 h-8 bg-blue-600 rounded-full block"></span>
         Giới thiệu sách
      </h2>
      
      <div className="text-base text-gray-600 dark:text-gray-300 leading-relaxed text-justify space-y-4 font-normal">
          <div className="whitespace-pre-line">{displayText}</div>
          {shouldTruncate && (
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="group flex items-center gap-2 px-6 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full text-sm font-medium text-primary dark:text-blue-400 transition-all duration-200"
              >
                {showFullDescription ? (
                  <>
                    Thu gọn
                    <svg className="w-4 h-4 transform group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    Xem thêm
                    <svg className="w-4 h-4 transform group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}
      </div>
    </div>
  );
});

BookDescription.displayName = 'BookDescription';
export default BookDescription;