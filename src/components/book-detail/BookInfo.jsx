import React from 'react';
import StarRating from './StarRating';
import BookMetadata from './BookMetadata';
import BookActions from './BookAction';

const BookInfo = React.memo(({ book, onRead, onFavorite, onDownload, isFavorited, loadingFavorite }) => {
  return (
    <div className="lg:col-span-3 flex flex-col justify-center">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
        {book.title}
      </h1>

      <div className="flex flex-wrap items-center gap-4 mb-8 text-sm">
         <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full border border-yellow-100 dark:border-yellow-700/30">
            <span className="font-bold text-yellow-700 dark:text-yellow-500">{book.rating ? Number(book.rating).toFixed(1) : '0.0'}</span>
            <StarRating rating={book.rating || 0} showValue={false} size="w-4 h-4" />
         </div>
         <span className="text-gray-300 dark:text-gray-600">|</span>
         <span className="text-gray-600 dark:text-gray-400 font-medium cursor-pointer hover:text-primary transition-colors">{book.totalReviews} đánh giá</span>
      </div>

      <div className="mb-8 border-t border-b border-gray-100 dark:border-gray-700 py-8">
        <BookMetadata
            metadata={{
            author: book.authors,
            genre: book.category,
            publisher: book.publisher,
            publishDate: book.publishDate,
            }}
        />
      </div>

      <BookActions
        onRead={onRead}
        onFavorite={onFavorite}
        onDownload={onDownload}
        isFavorited={isFavorited}
        loadingFavorite={loadingFavorite}
      />
    </div>
  );
});

BookInfo.displayName = 'BookInfo';
export default BookInfo;