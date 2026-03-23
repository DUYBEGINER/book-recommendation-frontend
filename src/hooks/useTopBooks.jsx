import { useState, useEffect } from "react";
import { getMostReadBooks } from "../services/bookService";

/**
 * Custom hook to fetch and manage top books (most read)
 *
 * @param {number} pageSize - Number of books to fetch (default: 4)
 * @returns {Object} - { topBooks: Array, loading: boolean, error: string|null }
 *
 * @example
 * const { topBooks, loading, error } = useTopBooks(4);
 */
const useTopBooks = (pageSize = 4) => {
  const [topBooks, setTopBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadTopBooks = async () => {
      try {
        setLoading(true);
        const response = await getMostReadBooks(0, pageSize);

        if (!controller.signal.aborted) {
          setTopBooks(Array.isArray(response?.data) ? response.data : []);
          setError(null);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Error loading top books:", err);
          setError("Không thể tải sách nổi bật");
          setTopBooks([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadTopBooks();

    return () => controller.abort();
  }, [pageSize]);

  return { topBooks, loading, error };
};

export default useTopBooks;
