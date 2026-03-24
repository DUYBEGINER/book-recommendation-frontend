import React from 'react';
import ReviewCard from './ReviewCard';

const ReviewsList = React.memo(({ reviews, onLoadMore, hasMore = false, loadingMore = false }) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      {reviews.length === 0 && !loadingMore && (
        <p className="text-gray-400 dark:text-gray-500 text-center py-6 sm:py-8 text-xs sm:text-sm">Chưa có đánh giá nào.</p>
      )}

      {reviews.map((review, index) => (
        <ReviewCard key={`review-${index}-${review.date}`} review={review} />
      ))}

      {hasMore && (
        <div className="text-center pt-2">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="text-xs sm:text-sm font-medium text-primary hover:text-primary-hover dark:text-red-400 dark:hover:text-red-300 py-2 px-4 sm:px-6 rounded-full border border-primary/30 dark:border-red-400/30 hover:bg-primary/5 dark:hover:bg-red-400/5 transition-all disabled:opacity-50"
          >
            {loadingMore ? 'Đang tải...' : 'Xem thêm đánh giá'}
          </button>
        </div>
      )}
    </div>
  );
});

ReviewsList.displayName = 'ReviewsList';
export default ReviewsList;