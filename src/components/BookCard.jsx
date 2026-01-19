"use client"
import { Pen, Star, Calendar, BookOpen } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { getPreviewBook } from "../services/bookService"

const BookCard = ({ book }) => {
  const navigate = useNavigate()
  const [showTooltip, setShowTooltip] = useState(false)
  const [previewBook, setPreviewBook] = useState({})
  const [previewCache, setPreviewCache] = useState({})
  
  const fetchPreviewBook = async (bookId) => {
    try {
       if (previewCache[bookId]) {
        setPreviewBook(previewCache[bookId])
        setShowTooltip(true)
        return
      }
      const data = await getPreviewBook(bookId);
      console.log("Preview book data:", data);
      setPreviewCache(prev => ({ ...prev, [bookId]: data }))
      setPreviewBook(data);
      setShowTooltip(true);
    } catch (error) {
      console.error("Failed to fetch book preview:", error);
    }
  }


  const handleClick = () => {
    navigate(`/books/${book.bookId}`)
  }

  return (
    <div 
      className="min-w-[180px] w-[180px] cursor-pointer flex-shrink-0 relative" 
      onClick={handleClick}
      onMouseEnter={() => fetchPreviewBook(book.bookId)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative overflow-hidden rounded-lg shadow-md transition-transform duration-300 hover:scale-105 group">
        <img src={book.coverImageUrl || "/placeholder.svg"} alt={book.title} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </div>
      <h3 className="mt-3 font-semibold text-gray-800 dark:text-white line-clamp-2 text-sm">{book.title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-300 mt-1 flex gap-2 items-center">
        <Pen size={14} className="flex-shrink-0" />
        <span className="truncate">{book.authors?.map(a => a.authorName).join(", ") || "-"}</span>
      </p>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute left-full top-0 ml-4 z-50 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 pointer-events-none animate-fadeIn">
          {/* Arrow */}
          <div className="absolute right-full top-8 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white dark:border-r-gray-800"></div>
          
          <div className="flex gap-4">
            {/* Book Cover */}
            <img 
              src={previewBook.coverImageUrl || "/placeholder.svg"} 
              alt={previewBook.title} 
              className="w-24 h-32 object-cover rounded-lg shadow-md flex-shrink-0"
            />
            
            {/* Book Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">
                {previewBook.title}
              </h4>
              
              <div className="space-y-1.5 text-xs">
                {/* Author */}
                <div className="flex items-start gap-2">
                  <Pen size={12} className="flex-shrink-0 mt-0.5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300 line-clamp-1">
                    {previewBook.authors?.map(a => a.authorName).join(", ") || "Không rõ tác giả"}
                  </span>
                </div>
                
                {/* Rating */}
                {previewBook.averageRating !== undefined && (
                  <div className="flex items-center gap-2">
                    <Star size={12} className="flex-shrink-0 text-yellow-400 fill-yellow-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {previewBook.averageRating.toFixed(1)} ({previewBook.totalReviews || 0} đánh giá)
                    </span>
                  </div>
                )}
                
                {/* Genre */}
                {previewBook.genres && previewBook.genres.length > 0 && (
                  <div className="flex items-start gap-2">
                    <BookOpen size={12} className="flex-shrink-0 mt-0.5 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300 line-clamp-1">
                      {previewBook.genres.map(g => g.genreName).join(", ")}
                    </span>
                  </div>
                )}
                
                {/* Publication Year */}
                {previewBook.publicationYear && (
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="flex-shrink-0 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Năm xuất bản: {previewBook.publicationYear}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Description Preview */}
              {previewBook.description && (
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                  {previewBook.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookCard;
