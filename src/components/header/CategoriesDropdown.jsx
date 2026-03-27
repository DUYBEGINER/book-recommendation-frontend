import React, {useMemo} from "react";
import { useNavigate } from "react-router-dom";
import useGenres from "../../hooks/useGenres"; 

const CategoryDropdown = ({ onSelect }) => {
  const navigate = useNavigate();
  
  const { genres, isLoading } = useGenres();

  const handleCategoryClick = (category) => {
    if (onSelect) {
      onSelect(category);
      return;
    }
    navigate(`/category/${category.genreId}?name=${encodeURIComponent(category.genreName)}`);
  };

  const columns = useMemo(() => {
    if (!genres.length) {
      return [];
    }

    const columnCount = 3;
    const result = Array.from({ length: columnCount }, () => []);

    genres.forEach((genre, index) => {
      result[index % columnCount].push(genre);
    });

    return result;
  }, [genres]);

  return (
    <div className="absolute pointer-events-none group-hover:pointer-events-auto top-full left-0 mt-0 pt-2 bg-transparent z-50 min-w-96">
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl shadow-xl dark:shadow-2xl border border-gray-200/80 dark:border-gray-700/60 py-4 transition-all duration-300 ease-in-out -translate-y-2 group-hover:translate-y-0 transform scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100 backdrop-blur-xl">
        <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Sách</h3>
        </div>

        <div className="py-4 px-4">
          {isLoading ? (
            <div className="px-2 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Đang tải thể loại...
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-8">
              {onSelect && (
                <div className="col-span-3 mb-2">
                  <button
                    onClick={() => onSelect(null)}
                    className="w-full text-left py-1 transition-colors text-sm text-primary hover:text-primary-hover dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Tất cả sách
                  </button>
                </div>
              )}
              {columns.length ? (
                columns.map((column, columnIndex) => (
                  <div key={columnIndex} className="space-y-2">
                    {column.map((item) => (
                      <button
                        key={item.genreId}
                        onClick={() => handleCategoryClick(item)}
                        className="w-full text-left py-1 transition-colors text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-300"
                      >
                        {item.genreName}
                      </button>
                    ))}
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  Chưa có thể loại nào để hiển thị.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CategoryDropdown);
