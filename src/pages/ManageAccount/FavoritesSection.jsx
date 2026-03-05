import React, { useState, useEffect, useCallback, useRef } from "react"
import { Book, Trash2, Loader2 } from "lucide-react"
import { Modal } from "antd"
import EmptyState from "../../components/account/EmptyState"
import BookCard from "../../components/common/BookCard"
import useAuth from "../../hooks/useAuth"
import { getBookFavorites, removeFavorite } from "../../services/favoriteService"
import useMessage from "../../hooks/useMessage";
import { sendFeedback } from "../../utils/feedbackHelper"

const PAGE_SIZE = 12;

const FavoritesSection = React.memo(() => {
  const message = useMessage();
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const { user } = useAuth();
  const userId = user?.userId;

  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);

  const fetchFavorites = useCallback(async (pageIndex = 0, reset = false) => {
    if (!userId || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const data = await getBookFavorites(userId, { page: pageIndex, size: PAGE_SIZE });
      const content = data?.content || [];
      const totalPages = data?.totalPages || 0;

      setFavoriteBooks(prev => reset ? content : [...prev, ...content]);
      setHasMore(pageIndex + 1 < totalPages);
      setPage(pageIndex);
    } catch (error) {
      console.error("Failed to fetch favorite books:", error);
      message.error("Không thể tải sách yêu thích");
    } finally {
      setLoading(false);
      setInitialLoading(false);
      loadingRef.current = false;
    }
  }, [userId, message]);

  // Initial fetch
  useEffect(() => {
    if (!userId) return;
    setFavoriteBooks([]);
    setPage(0);
    setHasMore(true);
    setInitialLoading(true);
    fetchFavorites(0, true);
  }, [userId, fetchFavorites]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingRef.current) {
          fetchFavorites(page + 1);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, page, fetchFavorites]);

  const handleRemoveFavorite = useCallback(async (bookId) => {
    try {
      await removeFavorite(userId, bookId);
      message.success("Đã xóa khỏi yêu thích");
      setFavoriteBooks(prev => prev.filter(fav => {
        const favBookId = fav.bookId || fav.book?.id || fav.id;
        return favBookId !== bookId;
      }));
      sendFeedback(userId, bookId, 'favorite', 0);
    } catch (error) {
      message.error("Xóa thất bại. Vui lòng thử lại");
      console.error("Remove favorite failed:", error);
    }
  }, [userId, message]);

  const confirmRemove = useCallback((book) => {
    const bookData = book.book || book;
    const bookId = book.bookId || book.book?.id || book.id;
    Modal.confirm({
      title: 'Xác nhận xóa sách yêu thích',
      content: `Bạn có chắc muốn xóa "${bookData.title}" khỏi danh sách yêu thích không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => handleRemoveFavorite(bookId),
    });
  }, [handleRemoveFavorite]);

  if (initialLoading) {
    return (
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">SÁCH YÊU THÍCH</h2>
        <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          <span>Đang tải danh sách yêu thích...</span>
        </div>
      </div>
    );
  }

  if (favoriteBooks.length === 0) {
    return (
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">SÁCH YÊU THÍCH</h2>
        <EmptyState icon={Book} message="Bạn chưa có sách yêu thích nào" />
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 shrink-0">SÁCH YÊU THÍCH</h2>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 pb-4 overflow-y-auto max-h-[calc(100vh-400px)] sm:max-h-[calc(100vh-380px)]"
      >
        {favoriteBooks.map((book) => (
          <div key={book.id} className="relative group flex justify-center">
            <BookCard book={book.book || book} />
            <button
              onClick={() => confirmRemove(book)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
              aria-label="Xóa khỏi yêu thích"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Sentinel element for IntersectionObserver */}
      <div ref={sentinelRef} className="h-1" />

      {loading && !initialLoading && (
        <div className="flex items-center justify-center py-4 text-gray-500 dark:text-gray-400">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span className="text-sm">Đang tải thêm...</span>
        </div>
      )}

      {!hasMore && favoriteBooks.length > 0 && (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
          Đã hiển thị tất cả {favoriteBooks.length} sách yêu thích
        </p>
      )}
    </div>
  )
})

FavoritesSection.displayName = "FavoritesSection"
export default FavoritesSection
