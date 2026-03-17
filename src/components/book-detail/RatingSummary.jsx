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

  // Merge provided distribution with defaults
  const distribution = { ...defaultDistribution, ...ratingDistribution };

  return (
    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-6 sm:p-8 mb-8 border border-gray-100 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
         
         {/* Left: Overall Score */}
         <div className="md:col-span-4 lg:col-span-3 text-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-600 pb-6 md:pb-0 md:pr-6">
             <div className="text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-2">
               {rating ? Number(rating).toFixed(1) : '0.0'}
             </div>
             <div className="flex justify-center mb-2 text-yellow-500">
                <StarRating rating={rating || 0} showValue={false} size="w-5 h-5" />
             </div>
             <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
               {totalReviews} đánh giá
             </div>
         </div>
         
         {/* Middle: Progress Bars */}
         <div className="md:col-span-8 lg:col-span-6 space-y-3">
            {[5, 4, 3, 2, 1].map((star) => (
               <div key={star} className="flex items-center gap-4 text-sm">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 w-3">{star}</span>
                  <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-yellow-400 rounded-full" 
                        style={{ width: `${Math.min(Math.max(distribution[star] || 0, 0), 100)}%` }}
                     />
                  </div>
                  <span className="text-gray-400 text-xs w-8 text-right">{distribution[star]}%</span>
               </div>
            ))}
         </div>

         {/* Right/Bottom: Call to Action */}
         <div className="md:col-span-12 lg:col-span-3 lg:border-l border-gray-200 dark:border-gray-600 lg:pl-6 flex flex-col justify-center">
             <div className="text-center lg:text-left mb-4 lg:mb-6">
                 <p className="font-medium text-gray-900 dark:text-white">Bạn đã đọc sách này?</p>
                 <p className="text-sm text-gray-500 dark:text-gray-400">Chia sẻ cảm nhận của bạn với mọi người</p>
             </div>
             <button 
                onClick={onWriteReview}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-primary hover:bg-primary-hover dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-95"
            >
                <PencilLine size={18} /> 
                Viết đánh giá
            </button>
         </div>

      </div>
    </div>
  );
});

RatingSummary.displayName = 'RatingSummary';
export default RatingSummary;