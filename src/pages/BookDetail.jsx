
import React, { useMemo, useCallback, useEffect, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Breadcrumb } from 'antd';
import ScrollToTop from '../components/common/ScrollToTop';
import useBookDetail from '../hooks/useBookDetail';
import useFavorite from '../hooks/useFavorite';
import useBookReviews from '../hooks/useBookReviews';
import useSameGenreBooks from '../hooks/useSameGenreBooks';

const BookCover = React.lazy(() => import('../components/book-detail/BookCover'));
const BookInfo = React.lazy(() => import('../components/book-detail/BookInfo'));
const RelatedBooks = React.lazy(() => import('../components/book-detail/RelatedBooks'));
const BookDescription = React.lazy(() => import('../components/book-detail/BookDescription'));
const ReviewsSection = React.lazy(() => import('../components/book-detail/ReviewsSection'));

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('BookDetail Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600">Vui lòng thử lại sau.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const BookDetail = () => {
  const navigate = useNavigate();
  console.log('Rendering BookDetail');
  const { book, bookData, loading, handleRead, handleDownload } = useBookDetail();
  const { isFavorited, loadingFavorite, handleFavorite, syncFavorite } = useFavorite(book?.id);

  // Fetch books that share at least one genre with the current book.
  // Starts only once `book.id` is resolved; no-ops on null/undefined.
  const { books: sameGenreBooks, loading: loadingSameGenre } = useSameGenreBooks(book?.id);

  // Derive the first genre for the "Xem tất cả" navigation in RelatedBooks.
  const firstGenre = bookData?.genres?.[0];

  const ratingStats = useMemo(() => bookData ? {
    averageRating: bookData.averageRating ?? 0,
    totalReviews: bookData.totalReviews ?? 0,
  } : null, [bookData]);

  const { reviews, avgRating, totalReviews, hasMore, loadingMore, loadMore, handleReviewSubmit } = useBookReviews(book?.id, ratingStats);

  // Sync favorite state from the book detail response
  useEffect(() => {
    if (!bookData) return;
    syncFavorite(bookData.isFav ?? false);
  }, [bookData, syncFavorite]);

  const breadcrumbItems = useMemo(() => [
    { title: <Link to="/">Trang chủ</Link> },
    { title: <p>Chi tiết sách</p> },
  ], []);

  const handleSearchSubmit = useCallback((keyword) => {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword) {
      navigate(`/search?q=${encodeURIComponent(trimmedKeyword)}`);
    }
  }, [navigate]);

  // Compose the enriched book object for BookInfo
  const enrichedBook = useMemo(() => {
    if (!book) return null;
    return {
      ...book,
      rating: avgRating,
      totalReviews,
      reviewsList: reviews,
    };
  }, [book, avgRating, totalReviews, reviews]);

  return (
    <MainLayout showHero={false} onSearchSubmit={handleSearchSubmit}>
      <ScrollToTop />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 transition-colors duration-300">
          
          {/* Top Section - White background */}
          <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
             <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
               <Breadcrumb separator=">" items={breadcrumbItems} className="mb-12" />
               
               {/* Loading State */}
                {loading && (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Đang tải thông tin sách...</p>
                  </div>
                )}

                {/* Error State - No book found */}
                {!loading && !book && (
                  <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Không tìm thấy sách</h2>
                    <p className="text-gray-600 dark:text-gray-400">Sách bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                  </div>
                )}

               {/* Main Book Detail - Hero Section */}
               {!loading && enrichedBook && (
                  <ErrorBoundary>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 pb-8">
                      <div className="lg:col-span-4 xl:col-span-3 flex justify-center lg:justify-start">
                         <Suspense fallback={<div className="h-96 w-64 bg-gray-200 animate-pulse rounded-lg"></div>}>
                            <BookCover src={enrichedBook.cover} alt={enrichedBook.title} className="shadow-2xl hover:shadow-3xl transition-shadow duration-300" />
                         </Suspense>
                      </div>
                      <div className="lg:col-span-8 xl:col-span-9">
                        <Suspense fallback={<div className="h-40 bg-gray-100 animate-pulse rounded"></div>}>
                            <BookInfo
                              book={enrichedBook}
                              onRead={handleRead}
                              onFavorite={handleFavorite}
                              isFavorited={isFavorited}
                              loadingFavorite={loadingFavorite}
                              onDownload={handleDownload}
                            />
                        </Suspense>
                      </div>
                    </div>
                  </ErrorBoundary>
                )}
             </div>
          </div>

          {/* Content Section - Light background */}
          {!loading && enrichedBook && (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
               {/* Main Content - Full Width to fix asymmetry */}
               <div className="space-y-8">
                  <ErrorBoundary>
                    <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse rounded-2xl"></div>}>
                       <BookDescription description={enrichedBook.description} />
                    </Suspense>
                    <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse rounded-2xl"></div>}>
                       <ReviewsSection
                          rating={enrichedBook.rating}
                          totalReviews={enrichedBook.totalReviews}
                          reviews={enrichedBook.reviewsList || []}
                          bookTitle={enrichedBook.title}
                          onLoadMore={loadMore}
                          hasMore={hasMore}
                          loadingMore={loadingMore}
                          onReviewSubmit={handleReviewSubmit}
                        />
                    </Suspense>
                  </ErrorBoundary>
               </div>

               {/* Related Books Section */}
               <ErrorBoundary>
                 <Suspense fallback={<div className="text-center py-4">Loading related books...</div>}>
                   <RelatedBooks
                     books={sameGenreBooks}
                     loading={loadingSameGenre}
                     genreId={firstGenre?.genreId}
                     genreName={firstGenre?.genreName}
                   />
                 </Suspense>
               </ErrorBoundary>
            </div>
          )}
      </div>
    </MainLayout>
  );
};

export default BookDetail;
