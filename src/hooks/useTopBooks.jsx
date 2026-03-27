import { getMostReadBooks } from "../services/bookService";
import { useQuery } from "@tanstack/react-query";

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
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["topBooks", pageSize],
    queryFn: ({signal}) => getMostReadBooks(0, pageSize, signal),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
  console.log("Top books query data:", data);
  return {
    topBooks: Array.isArray(data) ? data : [],
    loading: isLoading,
    error: isError ? error.message : null,
  };
};

export default useTopBooks;

