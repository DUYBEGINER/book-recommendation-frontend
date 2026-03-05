import React, { useState, useCallback, useEffect } from "react";
import { History, Loader2 } from "lucide-react";
import EmptyState from "../../components/account/EmptyState";
import BookCard from "../../components/common/BookCard";
import Pagination from "../../components/admin/Pagination";
import { getUserHistory } from "../../services/historyService";
import useAuth from "../../hooks/useAuth";

const PAGE_SIZE = 8;

const EMPTY_PAGINATION = {
  number: 0,
  size: PAGE_SIZE,
  totalPages: 0,
  totalElements: 0,
};

/**
 * Format timestamp to Vietnamese locale string.
 * Pure utility — no component dependency.
 */
const formatLastReadTime = (timestamp) => {
  if (!timestamp) return "";
  try {
    return new Date(timestamp).toLocaleString("vi-VN", { hour12: false });
  } catch {
    return "";
  }
};

const HistorySection = React.memo(() => {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userId = user?.userId;

  const fetchHistory = useCallback(
    async (pageIndex = 0) => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const { history, page } = await getUserHistory(userId, {
          page: pageIndex,
          size: PAGE_SIZE,
        });

        setHistoryItems(history);
        setPagination(
          page
            ? {
                number: page.number ?? pageIndex,
                size: page.size ?? PAGE_SIZE,
                totalPages: page.totalPages ?? 0,
                totalElements: page.totalElements ?? history.length,
              }
            : {
                number: pageIndex,
                size: PAGE_SIZE,
                totalPages: history.length > 0 ? 1 : 0,
                totalElements: history.length,
              },
        );
      } catch (err) {
        console.error("Failed to load reading history:", err);
        setError(err);
        setHistoryItems([]);
        setPagination(EMPTY_PAGINATION);
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    fetchHistory(0);
  }, [fetchHistory]);

  const handlePageChange = useCallback(
    (pageNumber) => {
      if (!pagination.totalPages) return;
      if (pageNumber < 1 || pageNumber > pagination.totalPages) return;
      fetchHistory(pageNumber - 1);
    },
    [fetchHistory, pagination.totalPages],
  );

  const hasHistory = historyItems.length > 0;
  const showPagination = pagination.totalPages > 1;

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">LỊCH SỬ ĐỌC SÁCH</h2>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Không thể tải lịch sử đọc. Vui lòng thử lại sau.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          <span>Đang tải lịch sử đọc...</span>
        </div>
      ) : !hasHistory ? (
        <EmptyState icon={History} message="Chưa có lịch sử đọc sách" />
      ) : (
        <>
          <div className="grid gap-4 md:gap-6 xl:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {historyItems.map((item) => {
              const progressValue = typeof item.progress === "number" ? Math.round(item.progress) : null;
              const book = item.book ?? {
                id: item.bookId,
                title: "Sách",
                coverImageUrl: "",
                authors: [],
              };

              return (
                <div key={item.id ?? item.bookId ?? `${book.id}-${item.lastReadAt}`} className="flex flex-col items-center">
                  <div className="relative">
                    <BookCard book={book} />
                    {progressValue !== null && (
                      <span className="absolute left-2 top-2 rounded-full bg-blue-600/90 px-3 py-1 text-xs font-medium text-white shadow">
                        Đọc {progressValue}%
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Cập nhật: {formatLastReadTime(item.lastReadAt) || "Chưa có dữ liệu"}
                  </p>
                </div>
              );
            })}
          </div>

          {showPagination && (
            <Pagination
              currentPage={pagination.number + 1}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
});

HistorySection.displayName = "HistorySection";
export default HistorySection;
