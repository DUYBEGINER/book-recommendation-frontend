import React, {useState, useCallback} from 'react';
import RatingSummary from './RatingSummary';
import ReviewsList from './ReviewsList';
import ReviewModal from './ReviewModal';

const ReviewsSection = React.memo(({ rating, totalReviews, reviews, onLoadMore, hasMore, loadingMore, bookTitle, onReviewSubmit }) => {
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const handleWriteReview = useCallback(() => {
        setIsReviewModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsReviewModalOpen(false);
    }, []);

    const handleSubmitReview = useCallback((newReview) => {
        if (onReviewSubmit) {
            onReviewSubmit(newReview);
        }
    }, [onReviewSubmit]);

    return (
        <>
        <div className="pt-6 sm:pt-10">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Đánh giá & Nhận xét</h2>
          <RatingSummary rating={rating} totalReviews={totalReviews} onWriteReview={handleWriteReview} />
          <ReviewsList reviews={reviews} onLoadMore={onLoadMore} hasMore={hasMore} loadingMore={loadingMore} />
        </div>
        <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmitReview}
            bookTitle={bookTitle}
        />
        </>
    );
});

ReviewsSection.displayName = 'ReviewsSection';
export default ReviewsSection;