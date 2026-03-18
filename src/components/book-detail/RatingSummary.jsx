import React from 'react';
import { PencilLine } from 'lucide-react';
import StarRating from './StarRating';

const RatingSummary = React.memo(({ rating, totalReviews, onWriteReview, ratingDistribution = {} }) => {
  const defaultDistribution = {
    5: 60,
    4: 25,
    3: 5,
    2: 5,
    1: 5,
  };

  const distribution = { ...defaultDistribution, ...ratingDistribution };

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-6 mb-8 p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl shadow-sm">
      {/* Left: Big score */}
      <div className="flex flex-col items-center justify-center sm:min-w-[120px]">
        <div className="text-5xl font-bold text-gray-900 dark:text-white leading-none">
          {rating.toFixed(1)}
        </div>
        <StarRating rating={rating} showValue={false} size="w-3.5 h-3.5" />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{totalReviews} đánh giá</p>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px bg-gray-100 dark:bg-gray-700" />

      {/* Center: Distribution bars */}
      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((stars) => (
          <div key={stars} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-3 text-right">{stars}</span>
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${distribution[stars]}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 w-8 text-right">{distribution[stars]}%</span>
          </div>
        ))}
      </div>

      {/* Right: Write review button */}
      <div className="flex items-center sm:pl-2">
        <button
          onClick={onWriteReview}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-primary text-white rounded-full hover:bg-primary-hover transition-all text-sm font-medium shadow-md shadow-primary/20 active:scale-95"
        >
          <PencilLine size={16} /> Viết đánh giá
        </button>
      </div>
    </div>
  );
});

RatingSummary.displayName = 'RatingSummary';
export default RatingSummary;