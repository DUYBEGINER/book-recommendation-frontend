
import React, { useMemo, useCallback, Suspense, useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Breadcrumb } from 'antd';
import ScrollToTop from '../components/common/ScrollToTop';
import useAuth from '../hooks/useAuth';
import useMessage  from '../hooks/useMessage.jsx';

import { createOrUpdateRating, getBookRatings, getAverageRatingByBookId } from '../services/ratingService.js';
import { getBookFavorites, addFavorite, removeFavorite } from '../services/favoriteService';
import { getSimilarBooks, getBookReadUrl, getBookDownloadUrl } from '../services/bookService';
import { getBookDetail } from '../services/manageBookService';
import { sendFeedback } from '../utils/feedbackHelper';

// // Import all the new components
const BookCover = React.lazy(() => import('../components/book-detail/BookCover'));
const BookInfo = React.lazy(() => import('../components/book-detail/BookInfo'));
const RelatedBooks = React.lazy(() => import('../components/book-detail/RelatedBooks'));

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
  const { user, isAuthenticated } = useAuth();
  const message = useMessage();
  
  const [reviews, setReviews] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  
  ScrollToTop();

  //Get book ID from URL params
  const { id } = useParams();

  // // Event handlers
  const [bookData, setBookData] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch book detail by ID
  useEffect(() => {
    const fetchBookDetail = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const response = await getBookDetail(id);
        setBookData(response);
      } catch (error) {
        console.error("Failed to fetch book detail:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookDetail();
  }, [id]);

  // Fetch related books
  // useEffect(() => {
  //   const fetchBooks = async () => {
  //     try {
  //       const response = await getSimilarBooks(id, 10);
  //       setRelatedBooks(response.data || []);
  //     } catch (error) {
  //       console.error("Failed to fetch books for book detail page:", error);
  //     }
  //   };
  //   fetchBooks();
  // }, [id]);


  // Use bookData from API or fallback to default
  const book = useMemo(() => {
    if (!bookData) {
      return null;
    }
    return {
      id: bookData.bookId,
      title: bookData.title || 'Không có tiêu đề',
      rating: bookData.averageRating || 0,
      reviews: `${bookData.totalReviews || 0} Đánh giá`,
      category: bookData.genres?.map(g => g.genreName).join(', ') || 'Chưa phân loại',
      authors: bookData.authors?.map(a => a.authorName).join(', ') || 'Không rõ tác giả',
      publisher: bookData.publisher || 'Không rõ NXB',
      publishDate: bookData.publicationYear || 'Không rõ',
      cover: bookData.coverImageUrl || 'https://via.placeholder.com/300x400',
      description: bookData.description || 'Chưa có mô tả',
      reviewsList: bookData.reviews || [],
    };
  }, [bookData]);

  useEffect(() => {
    const fetchReviewsAndRating = async () => {
      if (!book?.id) {
        setReviews([]);
        setAvgRating(0);
        setTotalReviews(0);
        return;
      }

      try {
        // userId='0' → Backend sẽ trả TẤT CẢ ratings của sách
        const fetchedReviews = await getBookRatings('0', book.id);
        
        const mappedReviews = (fetchedReviews || []).map(review => ({
          name: review.userName,
          date: review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : 'N/A',
          rating: review.value,
          comment: review.comment,
        }));
        
        const calculatedAvgRating = mappedReviews.length > 0 
          ? mappedReviews.reduce((sum, review) => sum + review.rating, 0) / mappedReviews.length 
          : 0;
        
        setReviews(mappedReviews);
        setAvgRating(calculatedAvgRating);
        setTotalReviews(mappedReviews.length);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        setReviews([]);
        setAvgRating(0);
        setTotalReviews(0);
      }
    };
    fetchReviewsAndRating();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id]);

  //Chổ này khi lấy data chi tiết sách nên kiểm tra luôn xem sách đã được user yêu thích chưa để set trạng thái cho nút yêu thích cho đỡ phải chờ user click mới biết có yêu thích hay không
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!book?.id || !isAuthenticated || !user?.id) {
        return;
      }

      try {
        const favorites = await getBookFavorites(user.id);
        const bookId = Number(book.id);
        const isFav = favorites.some(
          fav => fav.bookId === bookId || fav.book?.id === bookId
        );
        setIsFavorited(isFav);
      } catch (error) {
        console.error('Failed to check favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [book?.id, isAuthenticated, user?.id]);


  const handleReviewSubmit = useCallback(async (reviewData) => {
    if (!isAuthenticated || !user?.id) {
      message.warning('Vui lòng đăng nhập để thực hiện đánh giá.');
      return;
    }

    if (!book?.id) {
      message.error('Không tìm thấy thông tin sách để đánh giá.');
      return;
    }

    try {
      const { rating, comment } = reviewData;
      
      // Submit rating
      await createOrUpdateRating(user.id, book.id, { value: rating, comment });
      
      // Send feedback to Recommendation System for online learning
      sendFeedback(user.id, book.id, 'rating', rating);
      
      // Fetch lại TẤT CẢ reviews với userId='0'
      const allReviews = await getBookRatings('0', book.id);
      
      const mappedReviews = (allReviews || []).map(review => ({
        name: review.userName,
        date: review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : 'N/A',
        rating: review.value,
        comment: review.comment,
      }));

      const calculatedAvgRating = mappedReviews.length > 0 
        ? mappedReviews.reduce((sum, review) => sum + review.rating, 0) / mappedReviews.length 
        : 0;

      setReviews(mappedReviews);
      setAvgRating(calculatedAvgRating);
      setTotalReviews(mappedReviews.length);
      
      message.success('Cảm ơn bạn đã gửi đánh giá!');
    } catch (error) {
      console.error('Failed to submit review:', error);
      message.error('Gửi đánh giá thất bại. Vui lòng thử lại.');
    }
  }, [isAuthenticated, user?.id, book?.id]);


  const handleRead = useCallback(async () => {
    const bookId = Number(book?.id);
    if (!Number.isFinite(bookId)) {
      message.warning('Không xác định được sách');
      return;
    }

    try {
      const result = await getBookReadUrl(bookId, 'EPUB');
      if (!result?.url) {
        message.warning('Không tìm thấy nội dung để đọc');
        return;
      }

      navigate('/reader', {
        state: {
          src: result.url,
          book: {
            id: bookId,
            title: book?.title ?? bookData?.title ?? '',
            coverImageUrl: book?.cover ?? bookData?.coverImageUrl ?? '',
            authors: bookData?.authors ?? [],
          },
        },
      });
    } catch {
      message.error('Không thể tải sách. Vui lòng thử lại.');
    }
  }, [book?.id, book?.title, book?.cover, bookData?.title, bookData?.coverImageUrl, bookData?.authors, message, navigate]);

  const handleDownload = useCallback(async () => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để tải sách');
      return;
    }

    const bookId = Number(book?.id);
    if (!Number.isFinite(bookId)) {
      message.error('Không xác định được sách để tải xuống');
      return;
    }

    const formats = bookData?.formats || [];
    const preferredPdf = formats.find(f => f.typeName?.toUpperCase() === 'PDF');
    const availableFormat = preferredPdf || formats[0];

    if (!availableFormat?.formatId) {
      message.warning('Không tìm thấy định dạng phù hợp để tải xuống');
      return;
    }

    try {
      const result = await getBookDownloadUrl(bookId, availableFormat.formatId);
      if (!result?.url) {
        message.error('Không thể tạo đường dẫn tải xuống');
        return;
      }

      const anchor = document.createElement('a');
      anchor.href = result.url;
      anchor.download = result.fileName || 'book';
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      message.success('Bắt đầu tải xuống sách');
    } catch {
      message.error('Tải xuống thất bại. Vui lòng thử lại.');
    }
  }, [book?.id, bookData?.formats, isAuthenticated, message]);

  const handleFavorite = useCallback(async () => {
    // Check if user is logged in
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để sử dụng tính năng này');
      return;
    }

    // Prevent double click
    if (loadingFavorite) return;
    
    if (!book?.id || !user?.id) {
      message.error('Không thể cập nhật yêu thích cho sách này');
      return;
    }

    const bookId = Number(book.id);

    setLoadingFavorite(true);
    try {
      if (isFavorited) {
        // Remove from favorites
        await removeFavorite(user.id, bookId);
        setIsFavorited(false);
        message.success('Đã xóa khỏi yêu thích');
        sendFeedback(user.id, bookId, 'favorite', 0); //Gửi phản hồi xóa yêu thích với giá trị 0 cập nhât model
      } else {
        // Add to favorites
        await addFavorite(user.id, bookId);
        setIsFavorited(true);
        message.success('Đã thêm vào yêu thích');
        
        // Send feedback to Recommendation System (only for add, not remove)
        sendFeedback(user.id, bookId, 'favorite');
      }
    } catch (error) {
      console.error('Favorite action failed:', error);
      message.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoadingFavorite(false);
    }
  }, [book?.id, isFavorited, isAuthenticated, user?.id, loadingFavorite, message]);

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

  return (
    <MainLayout showHero={false} onSearchSubmit={handleSearchSubmit}>
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 p-4 shadow-sm">
          <Breadcrumb separator=">" items={breadcrumbItems} />
        </div>
      </div>

      {/* Book Detail Content */}
      <div className="min-h-screen dark:bg-gray-900">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white dark:bg-gray-800 shadow-sm p-8 space-y-16">
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

            {/* Main Book Detail */}
            {!loading && book && (
              <ErrorBoundary>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
                    <BookCover src={book.cover} alt={book.title} />
                    <BookInfo
                      book={{ 
                      ...book, 
                      rating: avgRating, 
                      totalReviews: totalReviews,
                      reviewsList: reviews 
                    }}
                      onRead={handleRead}
                      onFavorite={handleFavorite}
                      isFavorited={isFavorited}
                      loadingFavorite={loadingFavorite}
                      onDownload={handleDownload}
                      onReviewSubmit={handleReviewSubmit}
                    />
                  </Suspense>
                </div>
              </ErrorBoundary>
            )}

            {/* Related Books */}
            {!loading && book && (
              <ErrorBoundary>
                <Suspense fallback={<div className="text-center py-4">Loading related books...</div>}>
                  <RelatedBooks books={relatedBooks} />
                </Suspense>
              </ErrorBoundary>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BookDetail;
