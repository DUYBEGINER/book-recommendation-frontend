import React from 'react';
import { Heart, Download, BookOpenText } from 'lucide-react';

const BookActions = React.memo(({ onRead, onFavorite, onDownload, isFavorited, loadingFavorite }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 sm:mb-10">
      <button
        onClick={onRead}
        className="inline-flex items-center gap-2 sm:gap-2.5 bg-primary hover:bg-primary-hover active:scale-[0.97] text-white px-4 sm:pl-5 sm:pr-7 py-2.5 sm:py-3 rounded-full transition-all duration-200 font-semibold text-sm sm:text-base shadow-lg shadow-primary/25 hover:shadow-lg hover:shadow-primary/30"
      >
        <BookOpenText className="w-4 h-4 sm:w-5 sm:h-5" />
        Bắt đầu Đọc
      </button>
      <button
        onClick={onFavorite}
        className={`p-2.5 sm:p-3 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all duration-200 active:scale-95 ${loadingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        disabled={loadingFavorite}
      >
        <Heart
          className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
            isFavorited
              ? 'fill-red-500 text-red-500'
              : 'text-gray-500 dark:text-gray-400'
          } ${loadingFavorite ? 'animate-pulse' : ''}`}
        />
      </button>
      <button
        onClick={onDownload}
        className="p-2.5 sm:p-3 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all duration-200 active:scale-95"
        aria-label="Download book"
      >
        <Download className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
      </button>
    </div>
  );
});

BookActions.displayName = 'BookActions';

export default BookActions;