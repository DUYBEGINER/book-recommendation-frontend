/**
 * Genre configurations for Home page
 *
 * NOTE: These IDs are hard-coded and match the database.
 * In the future, consider making this configurable via API
 * or using slug-based routing instead of numeric IDs.
 */

/**
 * Main genre carousel configs
 * These genres are displayed in the primary carousels on the home page
 */
export const MAIN_GENRE_CONFIG = [
  { id: 11, name: "Tài chính", title: "TÀI CHÍNH" },
  { id: 6, name: "Kỹ năng sống", title: "KỸ NĂNG SỐNG" },
  { id: 9, name: "Tiểu thuyết", title: "TIỂU THUYẾT" },
];

/**
 * Side title genre carousel configs
 * These genres are displayed in the side-title gradient section
 */
export const SIDE_GENRE_CONFIG = [
  { id: 12, name: "Văn học", title: "VĂN HỌC" , color: "from-blue-500 to-white"},
  { id: 8, name: "Trinh thám", title: "TRINH THÁM" , color: "from-green-500 to-white"},
  { id: 7, name: "Lịch sử", title: "LỊCH SỬ" , color: "from-purple-500 to-white"},
];

/**
 * Get all genre IDs that need to be lazy loaded
 * @returns {Array<number>} - Array of all genre IDs
 */
export const getAllGenreIds = () => {
  return [
    ...MAIN_GENRE_CONFIG.map((g) => g.id),
    ...SIDE_GENRE_CONFIG.map((g) => g.id),
  ];
};

/**
 * Page size constants
 */
export const DEFAULT_PAGE_SIZE = 12;
export const TOP_BOOKS_SIZE = 4;
