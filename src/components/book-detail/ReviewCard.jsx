import React from 'react';

import { Star } from 'lucide-react';

const ReviewCard = React.memo(({ review }) => {
  const { name, date, rating, comment } = review;
  const initial = (name || 'Ẩn danh').charAt(0).toUpperCase();

  return (
    <div className="flex gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
          <span className="font-semibold text-sm text-gray-900 dark:text-white">{name}</span>
          <div className="flex gap-0.5 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < rating ? 'fill-current' : 'stroke-current opacity-30'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">{date}</span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed break-words">
          {comment}
        </p>
      </div>
    </div>
  );
});

ReviewCard.displayName = 'ReviewCard';
export default ReviewCard;