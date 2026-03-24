import React from 'react';
import { useNavigate } from 'react-router-dom';

function SectionHeader(props) {
    const { title, subtitle, genreId, genreName, extra } = props;
    const navigate = useNavigate();

    const handleViewAll = (e) => {
        e.preventDefault();
        if (genreId) {
            // Navigate to category page with genre ID and name
            navigate(`/category/${genreId}?name=${encodeURIComponent(genreName || title)}`);
        }
    };

    return (
         <div className="w-full mb-4 sm:mb-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-base sm:text-xl font-medium text-gray-800 dark:text-white mb-1.5 sm:mb-2">{title}</h1>
                    <div className="w-20 sm:w-32 h-0.5 sm:h-1 bg-red-500 rounded-t-2xl"></div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    {extra}
                    {subtitle && (
                        <button
                            onClick={handleViewAll}
                            className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm hover:underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            Xem tất cả
                        </button>
                    )}
                </div>
            </div>
            <hr className="text-gray-200"/>
        </div>
    );
}

export default SectionHeader;
