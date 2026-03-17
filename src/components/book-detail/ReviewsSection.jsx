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
        <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <span className="w-1.5 h-8 bg-yellow-500 rounded-full block"></span>
                    Đánh giá & Nhận xét
                </h2>
                <div className="grid grid-cols-1">
                    <RatingSummary rating={rating} totalReviews={totalReviews}  onWriteReview={handleWriteReview}/>
                    <ReviewsList reviews={reviews} onLoadMore={onLoadMore} hasMore={hasMore} loadingMore={loadingMore} />
                </div>
            </div>
            {/* Review Modal */}
            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmitReview}
                bookTitle={bookTitle}
            />
        </div>
    );
});

ReviewsSection.displayName = 'ReviewsSection';
export default ReviewsSection;