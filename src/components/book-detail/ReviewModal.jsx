import React, { useState } from 'react';
import { X } from 'lucide-react';

const ReviewModal = ({ isOpen, onClose, onSubmit, bookTitle }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá');
      return;
    }
    if (comment.trim() === '') {
      alert('Vui lòng nhập nhận xét');
      return;
    }
    
    onSubmit({
      rating,
      comment: comment.trim(),
      date: new Date().toLocaleDateString('vi-VN'),
      name: 'Người dùng' // In real app, this would come from user Auth
    });
    
    // Reset form
    setRating(0);
    setComment('');
    onClose();
  };

  const handleRatingClick = (starRating) => {
    setRating(starRating);
  };

  const handleRatingHover = (starRating) => {
    setHoveredRating(starRating);
  };

  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Đánh giá và nhận xét
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          {/* Book title */}
          <div className="mb-6 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Đánh giá cho:</p>
            <p className="font-medium text-sm text-gray-900 dark:text-white">{bookTitle}</p>
          </div>

          {/* Rating Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Đánh giá
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => handleRatingHover(star)}
                  onMouseLeave={handleRatingLeave}
                  className="p-1 hover:scale-125 transition-transform duration-150"
                >
                  <svg
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'text-amber-400 fill-current'
                        : 'text-gray-200 dark:text-gray-600 fill-current'
                    } transition-colors`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {rating === 1 && 'Rất tệ'}
                {rating === 2 && 'Tệ'}
                {rating === 3 && 'Bình thường'}
                {rating === 4 && 'Hay'}
                {rating === 5 && 'Rất hay'}
              </p>
            )}
          </div>

          {/* Comment Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Nhận xét
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuốn sách rất hay và ý nghĩa..."
              className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none transition-all"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-right">
              {comment.length}/500 ký tự
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors text-sm font-semibold shadow-md shadow-primary/20"
            >
              Gửi nhận xét
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;