import React from 'react';
import { User, BookOpen, Building2, CalendarDays } from 'lucide-react';


const BookMetadata = React.memo(({ metadata }) => {
  const { author, genre, publisher, publishDate } = metadata;

  const metadataItems = [
    { label: 'Tác giả', value: author, icon: User },
    { label: 'Thể loại', value: genre, icon: BookOpen },
    { label: 'Nhà xuất bản', value: publisher, icon: Building2 },
    { label: 'Năm phát hành', value: publishDate, icon: CalendarDays },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
      {metadataItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 border border-gray-100 dark:border-gray-700/50"
          >
            <div className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary">
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{item.label}</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 break-words">{item.value || '—'}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
});

BookMetadata.displayName = 'BookMetadata';
export default BookMetadata;