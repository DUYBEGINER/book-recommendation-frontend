import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import BookCard from "../components/common/BookCard";
import { getGenreById } from "../services/genreService";
import { getBooksByGenre } from "../services/manageBookService";

const BOOKS_PER_PAGE = 12;

// ─── Sub-components ─────────────────────────────────────────────────────────

const LoadingSpinner = () => (
  <div className="text-center py-16">
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    <p className="mt-4 text-gray-600 dark:text-gray-300">Đang tải sách...</p>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-16">
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      Chưa có sách trong thể loại này
    </h3>
    <p className="text-gray-600 dark:text-gray-400">
      Vui lòng quay lại sau hoặc khám phá các thể loại khác
    </p>
  </div>
);

const BookListItem = React.memo(({ book }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all">
    <div className="flex gap-4">
      <img
        src={book.coverImageUrl || "/placeholder.svg"}
        alt={book.title}
        className="w-24 h-32 object-cover rounded-lg"
        loading="lazy"
      />
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <a href={`/books/${book.bookId}`}>{book.title}</a>
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {book.authors?.map((a) => a.authorName).join(", ") || "Không rõ tác giả"}
        </p>
      </div>
    </div>
  </div>
));
BookListItem.displayName = "BookListItem";

const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push({ type: "page", value: i });
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push({ type: "ellipsis", value: i });
      }
    }
    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex justify-center items-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        ← Trước
      </button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((item) =>
          item.type === "ellipsis" ? (
            <span key={`ellipsis-${item.value}`} className="text-gray-400">...</span>
          ) : (
            <button
              key={item.value}
              onClick={() => onPageChange(item.value)}
              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                currentPage === item.value
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {item.value}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        Sau →
      </button>
    </div>
  );
});
Pagination.displayName = "Pagination";

// ─── Main Component ─────────────────────────────────────────────────────────

const CategoryBooks = () => {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCategoryName = searchParams.get("name") || "Thể loại";

  // Genre info
  const [genreName, setGenreName] = useState(initialCategoryName);
  const [genreDescription, setGenreDescription] = useState("");
  const [genreLoading, setGenreLoading] = useState(false);

  // Books data
  const [books, setBooks] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [booksLoading, setBooksLoading] = useState(false);

  // UI state
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch genre info (single lightweight call) ────────────────────────────
  useEffect(() => {
    if (!categoryId) return;

    let cancelled = false;

    const fetchGenreInfo = async () => {
      setGenreLoading(true);
      try {
        const genre = await getGenreById(categoryId);
        if (cancelled) return;

        setGenreName(genre?.genreName || initialCategoryName);
        setGenreDescription(genre?.description || "");
      } catch {
        if (!cancelled) {
          setGenreName(initialCategoryName);
          setGenreDescription("");
        }
      } finally {
        if (!cancelled) setGenreLoading(false);
      }
    };

    // Reset page state & scroll to top on category change
    setCurrentPage(1);
    setSortBy("newest");
    window.scrollTo(0, 0);
    fetchGenreInfo();

    return () => { cancelled = true; };
  }, [categoryId, initialCategoryName]);

  // ── Fetch books (depends on categoryId, page, sort) ───────────────────────
  const fetchBooks = useCallback(async (page, sort) => {
    if (!categoryId) {
      setBooks([]);
      setTotalBooks(0);
      setTotalPages(1);
      return;
    }

    setBooksLoading(true);
    try {
      const result = await getBooksByGenre(categoryId, {
        page: page - 1, // API uses 0-based index
        size: BOOKS_PER_PAGE,
        sort,
      });

      const content = result?.content ?? [];
      const total = result?.total ?? 0;
      const pages = result?.totalPages ?? 1;

      setBooks(content);
      setTotalBooks(total);
      setTotalPages(pages);
    } catch {
      setBooks([]);
      setTotalBooks(0);
      setTotalPages(1);
    } finally {
      setBooksLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchBooks(currentPage, sortBy);
  }, [currentPage, sortBy, fetchBooks]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearchSubmit = useCallback(
    (keyword) => {
      const trimmed = keyword.trim();
      if (trimmed) {
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      }
    },
    [navigate]
  );

  const handleSortChange = useCallback((value) => {
    setSortBy(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ── Derived state ─────────────────────────────────────────────────────────
  const isLoading = genreLoading || booksLoading;

  return (
    <MainLayout onSearchSubmit={handleSearchSubmit}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <a href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Trang chủ
              </a>
              <span>/</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {genreName}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {genreName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {isLoading ? (
                    "Đang tải thông tin thể loại..."
                  ) : (
                    <>
                      {genreDescription && (
                        <span className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                          {genreDescription}
                        </span>
                      )}
                      Tìm thấy{" "}
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {totalBooks}
                      </span>{" "}
                      cuốn sách
                    </>
                  )}
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Sort Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sắp xếp:
              </label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="title-asc">Tên sách (A-Z)</option>
                <option value="title-desc">Tên sách (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Books Grid/List */}
          {booksLoading ? (
            <LoadingSpinner />
          ) : books.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                  {books.map((book) => (
                    <BookCard key={book.bookId} book={book} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {books.map((book) => (
                    <BookListItem key={book.bookId} book={book} />
                  ))}
                </div>
              )}

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CategoryBooks;