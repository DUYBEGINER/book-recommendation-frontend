import React from 'react';
import SectionHeader from '../common/SectionHeader';
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
  if (!loading && (!books || books.length === 0)) return null;

  return (
    <div className="pb-4">
      <SectionHeader
        title="Sách cùng thể loại"
        subtitle={!!genreId}
        genreId={genreId}
        genreName={genreName}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
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
