import { Pen, Star, Calendar, BookOpen } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { getPreviewBook } from "../../services/bookService"

/**
 * Calculate tooltip position relative to the trigger element.
 * Tries right side first, then left, and clamps vertically to viewport.
 */
const calcTooltipPosition = (triggerRect, tooltipWidth = 320, tooltipHeight = 280) => {
  const GAP = 12;
  const MARGIN = 8;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  let left, top;
  let arrowSide = "left"; // arrow points left → tooltip is on the right

  // Try placing on the right
  if (triggerRect.right + GAP + tooltipWidth + MARGIN <= viewportW) {
    left = triggerRect.right + GAP;
  } else if (triggerRect.left - GAP - tooltipWidth >= MARGIN) {
    // Place on the left
    left = triggerRect.left - GAP - tooltipWidth;
    arrowSide = "right";
  } else {
    // Fallback: place on the right, clamped
    left = Math.min(triggerRect.right + GAP, viewportW - tooltipWidth - MARGIN);
  }

  // Vertically centre on the trigger, clamped to viewport
  top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
  top = Math.max(MARGIN, Math.min(top, viewportH - tooltipHeight - MARGIN));

  return { left, top, arrowSide };
};

const BookCard = ({ book, className = "" }) => {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);
  const [previewBook, setPreviewBook] = useState({});
  const [previewCache, setPreviewCache] = useState({});
  const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0, arrowSide: "left" });

  const cardRef = useRef(null);
  const tooltipRef = useRef(null);
  const hoverTimer = useRef(null);

  const updateTooltipPosition = useCallback(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const tooltipEl = tooltipRef.current;
    const tooltipH = tooltipEl ? tooltipEl.offsetHeight : 280;
    setTooltipPos(calcTooltipPosition(rect, 320, tooltipH));
  }, []);

  const fetchPreviewBook = useCallback(async (bookId) => {
    if (!bookId) return;
    try {
      if (previewCache[bookId]) {
        setPreviewBook(previewCache[bookId]);
        setShowTooltip(true);
        updateTooltipPosition();
        return;
      }
      const data = await getPreviewBook(bookId);
      setPreviewCache(prev => ({ ...prev, [bookId]: data }));
      setPreviewBook(data);
      setShowTooltip(true);
      updateTooltipPosition();
    } catch (error) {
      console.error("Failed to fetch book preview:", error);
    }
  }, [previewCache, updateTooltipPosition]);

  // Recalculate position on scroll / resize while tooltip is visible
  useEffect(() => {
    if (!showTooltip) return;
    const handleReposition = () => updateTooltipPosition();
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [showTooltip, updateTooltipPosition]);

  // Re-measure after tooltip renders (to get correct height)
  useEffect(() => {
    if (showTooltip) updateTooltipPosition();
  }, [showTooltip, previewBook, updateTooltipPosition]);

  const handleMouseEnter = () => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setTooltipPos(calcTooltipPosition(rect));
    hoverTimer.current = setTimeout(() => fetchPreviewBook(book.bookId), 200);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimer.current);
    setShowTooltip(false);
  };

  const handleClick = () => {
    navigate(`/books/${book.bookId}`);
  };

  return (
    <div
      ref={cardRef}
      className={`w-full cursor-pointer relative ${className}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative overflow-hidden rounded-lg shadow-md transition-transform duration-300 hover:scale-105 group">
        <img src={book.coverImageUrl || "/placeholder.svg"} alt={book.title} className="w-full aspect-[3/4] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </div>
      <h3 className="mt-3 font-semibold text-gray-800 dark:text-white line-clamp-2 text-sm">{book.title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-300 mt-1 flex gap-2 items-center">
        <Pen size={14} className="flex-shrink-0" />
        <span className="truncate">{book.authors?.map(a => a.authorName).join(", ") || "-"}</span>
      </p>

      {/* Tooltip via Portal — renders at document.body level to avoid overflow clipping */}
      {showTooltip && createPortal(
        <div
          ref={tooltipRef}
          className="fixed z-[9999] w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 pointer-events-none animate-fadeIn"
          style={{ left: tooltipPos.left, top: tooltipPos.top }}
        >
          {/* Arrow */}
          {tooltipPos.arrowSide === "left" && (
            <div className="absolute right-full top-8 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white dark:border-r-gray-800" />
          )}
          {tooltipPos.arrowSide === "right" && (
            <div className="absolute left-full top-8 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-white dark:border-l-gray-800" />
          )}
          
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
        </div>,
        document.body
      )}
    </div>
  )
}

export default BookCard;
