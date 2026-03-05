import React, { useState, useEffect, useCallback } from "react"
import { Book, Trash2 } from "lucide-react"
import { Modal } from "antd"
import EmptyState from "../../components/account/EmptyState"
import BookCard from "../../components/common/BookCard"
import useAuth from "../../hooks/useAuth"
import { getBookFavorites, removeFavorite } from "../../services/favoriteService"
import useMessage from "../../hooks/useMessage";
import { sendFeedback } from "../../utils/feedbackHelper"

const FavoritesSection = React.memo(() => {
  const message = useMessage();
  const [favoriteBooks, setFavoriteBooks] = useState([]);
 
  const { user } = useAuth();

  const userId = user?.userId;

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      try {
        const booksData = await getBookFavorites(userId);
        setFavoriteBooks(booksData);
      } catch (error) {
        console.error("Failed to fetch favorite books:", error);
        message.error("Không thể tải sách yêu thích");
      }
    };
    fetchData();
    console.log("Fetch favorites run!");
  }, [userId, message]);

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

  if (favoriteBooks.length === 0) {
    return (
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">SÁCH YÊU THÍCH</h2>
        <EmptyState icon={Book} message="Bạn chưa có sách yêu thích nào" />
      </div>
    )
  }

  console.log("Rendering FavoritesSection with books:", favoriteBooks);
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 shrink-0">SÁCH YÊU THÍCH</h2>

      <div
        className="grid gap-3 sm:gap-4 lg:gap-6 pb-4 overflow-y-auto max-h-[calc(100vh-400px)] sm:max-h-[calc(100vh-380px)] p-2"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
      >
        {favoriteBooks.map((book) => (
          <div key={book.id} className="relative group">
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
    </div>
  )
})

FavoritesSection.displayName = "FavoritesSection"
export default FavoritesSection
