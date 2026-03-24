import React, { useMemo, useCallback, useEffect, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { Breadcrumb } from "antd";
import ScrollToTop from "../components/common/ScrollToTop";
import useBookDetail from "../hooks/useBookDetail";
import useFavorite from "../hooks/useFavorite";
import useBookReviews from "../hooks/useBookReviews";
import useSameGenreBooks from "../hooks/useSameGenreBooks";
import { applyPreset, isCloudinaryUrl } from "../utils/cloudinaryUtils";

const BookCover = React.lazy(
  () => import("../components/book-detail/BookCover"),
);
const BookInfo = React.lazy(() => import("../components/book-detail/BookInfo"));
const RelatedBooks = React.lazy(
  () => import("../components/book-detail/RelatedBooks"),
);

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
    console.error("BookDetail Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600">Vui lòng thử lại sau.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const BookDetail = () => {
  const navigate = useNavigate();
  console.log("Rendering BookDetail");
  const { book, bookData, loading, handleRead, handleDownload } =
    useBookDetail();
  const { isFavorited, loadingFavorite, handleFavorite, syncFavorite } =
    useFavorite(book?.id);

  // Fetch books that share at least one genre with the current book.
  // Starts only once `book.id` is resolved; no-ops on null/undefined.
  const { books: sameGenreBooks, loading: loadingSameGenre } =
    useSameGenreBooks(book?.id);

  // Derive the first genre for the "Xem tất cả" navigation in RelatedBooks.
  const firstGenre = bookData?.genres?.[0];

  const ratingStats = useMemo(
    () =>
      bookData
        ? {
            averageRating: bookData.averageRating ?? 0,
            totalReviews: bookData.totalReviews ?? 0,
          }
        : null,
    [bookData],
  );

  const {
    reviews,
    avgRating,
    totalReviews,
    hasMore,
    loadingMore,
    loadMore,
    handleReviewSubmit,
  } = useBookReviews(book?.id, ratingStats);

  // Sync favorite state from the book detail response
  useEffect(() => {
    if (!bookData) return;
    syncFavorite(bookData.isFav ?? false);
  }, [bookData, syncFavorite]);

  const breadcrumbItems = useMemo(
    () => [
      { title: <Link to="/">Trang chủ</Link> },
      { title: <p>Chi tiết sách</p> },
    ],
    [],
  );

  const handleSearchSubmit = useCallback(
    (keyword) => {
      const trimmedKeyword = keyword.trim();
      if (trimmedKeyword) {
        navigate(`/search?q=${encodeURIComponent(trimmedKeyword)}`);
      }
    },
    [navigate],
  );

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

  // Optimized background image URL for desktop (blur effect)
  const backgroundBlurUrl = useMemo(() => {
    if (!enrichedBook?.cover) return "";
    return isCloudinaryUrl(enrichedBook.cover)
      ? applyPreset(enrichedBook.cover, "backgroundBlur")
      : enrichedBook.cover;
  }, [enrichedBook?.cover]);

  // Optimized background image URL for mobile (no blur, low quality)
  const backgroundMobileUrl = useMemo(() => {
    if (!enrichedBook?.cover) return "";
    return isCloudinaryUrl(enrichedBook.cover)
      ? applyPreset(enrichedBook.cover, "backgroundMobile")
      : enrichedBook.cover;
  }, [enrichedBook?.cover]);

  return (
    <MainLayout showHero={false} onSearchSubmit={handleSearchSubmit}>
      <ScrollToTop />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <Breadcrumb separator=">" items={breadcrumbItems} />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 min-h-[70vh]">
            <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-primary animate-spin" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Đang tải thông tin sách...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && !book && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Không tìm thấy sách
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Sách bạn tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
          </div>
        )}

        {/* Main Book Detail */}
        {!loading && enrichedBook && (
          <>
            {/* Hero Section with blurred backdrop */}
            <div className="relative">
              {/* Desktop background - subtle blur */}
              <div className="hidden lg:block absolute inset-0 overflow-hidden pointer-events-none z-0">
                <img
                  className="absolute w-full h-full inset-0 scale-110 blur-2xl opacity-20 dark:opacity-10 bg-cover bg-center"
                  src={backgroundBlurUrl}
                  alt=""
                />
              </div>

              {/* Mobile background - cover image with gradient fade (no blur) */}
              <div className="lg:hidden absolute top-0 left-0 right-0 h-70 overflow-hidden pointer-events-none z-0">
                <img
                  className="absolute inset-0 bg-cover bg-top"
                  src={backgroundMobileUrl}
                  alt=""
                />
                {/* Gradient overlay - fade from top to bottom */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-10% via-gray-50/70 via-40% to-gray-50 dark:via-gray-900/70 dark:to-gray-900" />
              </div>

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                <ErrorBoundary>
                  <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 lg:gap-12">
                    <Suspense
                      fallback={
                        <div className="lg:w-72 aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
                      }
                    >
                      <BookCover
                        src={enrichedBook.cover}
                        alt={enrichedBook.title}
                      />
                    </Suspense>
                    <Suspense
                      fallback={
                        <div className="flex-1 space-y-4">
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                        </div>
                      }
                    >
                      <BookInfo
                        book={enrichedBook}
                        onRead={handleRead}
                        onFavorite={handleFavorite}
                        isFavorited={isFavorited}
                        loadingFavorite={loadingFavorite}
                        onDownload={handleDownload}
                        onReviewSubmit={handleReviewSubmit}
                        onLoadMore={loadMore}
                        hasMore={hasMore}
                        loadingMore={loadingMore}
                      />
                    </Suspense>
                  </div>
                </ErrorBoundary>
              </div>
            </div>

            {/* Related Books */}
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
                  </div>
                }
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                  <RelatedBooks
                    books={sameGenreBooks}
                    loading={loadingSameGenre}
                    genreId={firstGenre?.genreId}
                    genreName={firstGenre?.genreName}
                  />
                </div>
              </Suspense>
            </ErrorBoundary>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default BookDetail;
