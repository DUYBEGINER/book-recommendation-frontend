import React from 'react';
import BookCard from '../common/BookCard';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

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
  // Render nothing when there is neither data nor an active load — this
  // keeps the page clean when a book has no genre assignments.
  if (!loading && (!books || books.length === 0)) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 mt-8 border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md">
       <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-1.5 h-8 bg-teal-500 rounded-full block"></span>
              Sách cùng thể loại
          </h2>
          {!!genreId && (
            <Link 

                to={`/category/${genreId}?name=${encodeURIComponent(genreName)}`}
                className="group flex items-center gap-2 text-primary hover:text-primary-hover dark:text-teal-400 dark:hover:text-teal-300 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
               Xem tất cả 
               <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
       </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
