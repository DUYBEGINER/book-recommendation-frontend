import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import BookCard from '../common/BookCard';

// Number of placeholder cards to show while data is loading.
// Matches the default API limit so the layout doesn't shift on paint.
const SKELETON_COUNT = 6;

/**
 * Skeleton card — mirrors the dimensions of a real BookCard so the grid
 * doesn't reflow when real data arrives.
 */
const SkeletonCard = () => (
  <div className="w-full animate-pulse">
    <div className="rounded-lg bg-gray-200 dark:bg-gray-700 aspect-[3/4]" />
    <div className="mt-3 h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
    <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
  </div>
);

/**
 * RelatedBooks — renders a grid of books that share at least one genre with
 * the currently viewed book.
 *
 * Props:
 *   books    {Array}          – Mapped book list items from the API.
 *   loading  {boolean}        – Show skeleton placeholders while fetching.
 *   genreId  {string|null}    – First genre ID; enables the "Xem tất cả" link.
 *   genreName {string|null}   – Display name for the genre page navigation.
 */
const RelatedBooks = React.memo(({ books, loading = false, genreId, genreName }) => {
  const navigate = useNavigate();

  if (!loading && (!books || books.length === 0)) return null;

  const handleViewAll = () => {
    if (genreId) {
      navigate(`/category/${genreId}?name=${encodeURIComponent(genreName || 'Sách cùng thể loại')}`);
    }
  };

  return (
    <div className="pb-4">
      {/* Custom gradient header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-base sm:text-2xl font-bold bg-gradient-to-r from-primary via-white to-orange-400 bg-clip-text text-transparent">
          Sách cùng thể loại
        </h2>
        {genreId && (
          <button
            onClick={handleViewAll}
            className="flex items-center gap-0.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors group"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
        {loading
          ? Array.from({ length: SKELETON_COUNT }, (_, i) => <SkeletonCard key={i} />)
          : books.map((book) => <BookCard key={book.bookId} book={book} />)
        }
      </div>
    </div>
  );
});

RelatedBooks.displayName = 'RelatedBooks';
export default RelatedBooks;
