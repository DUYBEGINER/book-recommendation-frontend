import React from 'react';

import { Star } from 'lucide-react';

const StarRating = React.memo(({ rating, maxStars = 5, size = 'w-5 h-5', showValue = false }) => {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5 text-amber-400">
        {[...Array(maxStars)].map((_, i) => (
          <Star
            key={i}
            className={`${size} ${
              i < Math.floor(rating) ? 'fill-current' : 'stroke-current opacity-40'
            }`}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );
});

StarRating.displayName = 'StarRating';
export default StarRating;