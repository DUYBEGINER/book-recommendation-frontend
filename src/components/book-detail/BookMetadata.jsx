import React from 'react';
import { User, BookOpen, Building2, Calendar } from 'lucide-react';

const BookMetadata = React.memo(({ metadata }) => {
  const { author, genre, publisher, publishDate } = metadata;

  const items = [
    { icon: User, label: 'Tác giả', value: author },
    { icon: BookOpen, label: 'Thể loại', value: genre },
    { icon: Building2, label: 'Nhà xuất bản', value: publisher },
    { icon: Calendar, label: 'Năm phát hành', value: publishDate },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
           <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400">
             <Icon size={18} strokeWidth={2} />
           </div>
           <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white leading-normal break-words">{value || 'Đang cập nhật'}</p>
           </div>
        </div>
      ))}
    </div>
  );
});

BookMetadata.displayName = 'BookMetadata';
export default BookMetadata;