import React from 'react';
import StarRating from './StarRating';
import BookMetadata from './BookMetadata';
import BookActions from './BookAction';
import BookDescription from './BookDescription';
import ReviewsSection from './ReviewsSection';


const BookInfo = React.memo(({ book, onRead, onFavorite, onDownload, isFavorited, loadingFavorite, onReviewSubmit, onLoadMore, hasMore, loadingMore }) => {
  return (
    <div className="flex-1 min-w-0">
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight mb-3">
        {book.title}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-3 mb-6">
        <StarRating rating={book.rating} showValue />
        <span className="text-xs text-gray-400 dark:text-gray-500">|</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{book.totalReviews} Đánh giá</span>
      </div>

      {/* Metadata */}
      <BookMetadata
        metadata={{
          author: book.authors,
          genre: book.category,
          publisher: book.publisher,
          publishDate: book.publishDate,
        }}
      />

      {/* Action Buttons */}
      <BookActions
        onRead={onRead}
        onFavorite={onFavorite}
        onDownload={onDownload}
        isFavorited={isFavorited}
        loadingFavorite={loadingFavorite}
      />

      {/* Description */}
      <BookDescription description={book.description} />

      {/* Reviews */}
      <ReviewsSection
        rating={book.rating}
        totalReviews={book.totalReviews}
        reviews={book.reviewsList || []}
        bookTitle={book.title}
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onReviewSubmit={onReviewSubmit}
      />
    </div>
  );
});

BookInfo.displayName = 'BookInfo';
export default BookInfo;