# Frontend Refactoring Log

**Date:** 2026-03-05  
**Scope:** Project structure reorganization, dead code cleanup, naming convention fixes

---

## Summary

Restructured the entire `src/` directory to follow React best practices: consistent naming conventions, logical grouping of files, elimination of duplicate/dead code, and proper separation of concerns.

---

## 1. Deleted Dead/Duplicate Code

| File | Reason |
|------|--------|
| `src/data/API_URL.jsx` | Hardcoded `localhost:8080`, duplicate of `config/ApiConfig.js` which uses env variable |
| `src/utils/tokenUtils.jsx` | Duplicate of `utils/storage.js` — both managed `access_token` in localStorage |
| `src/utils/axiousClient.jsx` | Typo in filename ("axious"), only re-exported from `config/ApiConfig.js` |
| `src/utils/messageUtils.jsx` | Legacy code, fully replaced by `contexts/MessageProvider.jsx` |
| `src/contexts/ManageAccountContext.jsx` | Empty file, never imported |
| `src/components/FeaturesSection.jsx` | Never imported anywhere, dead code |
| `src/components/StatsSection.jsx` | Never imported anywhere, dead code |
| `src/data/` (folder) | Removed — only contained the deleted `API_URL.jsx` |

**Impact:** `src/pages/Upload.jsx` was the only consumer of `axiousClient.jsx` — updated to import directly from `config/ApiConfig.js`.

---

## 2. Folder Renames (Naming Convention Fixes)

| Before | After | Reason |
|--------|-------|--------|
| `src/hook/` | `src/hooks/` | React convention: plural for collection folders |
| `src/constant/` | `src/constants/` | Standard convention: plural |
| `src/layout/` | `src/layouts/` | Consistency: plural |

---

## 3. File Renames

| Before | After | Reason |
|--------|-------|--------|
| `constants/routePath.jsx` | `constants/routePaths.js` | Plural naming; `.js` extension (no JSX content) |
| `services/bookFavorite.js` | `services/favoriteService.js` | Consistent `*Service.js` naming pattern |
| `pages/Admin/AdminAddbook.jsx` | `pages/Admin/AdminAddBook.jsx` | Fix inconsistent PascalCase |
| `pages/Admin/AdminEditbook.jsx` | `pages/Admin/AdminEditBook.jsx` | Fix inconsistent PascalCase |

---

## 4. Files Moved to Correct Locations

### Route Guards → `components/routes/`
Route guard components were mixed with regular UI components. Moved to dedicated folder:

| File | From | To |
|------|------|----|
| `ProtectedRoute.jsx` | `components/` | `components/routes/` |
| `AdminRoute.jsx` | `components/` | `components/routes/` |
| `UserRoute.jsx` | `components/` | `components/routes/` |

### Auth Components → `components/auth/`
Auth-related components were scattered in the root:

| File | From | To |
|------|------|----|
| `AuthModal.jsx` | `components/` | `components/auth/` |
| `ForgotPassword.jsx` | `components/` | `components/auth/` |
| `ConfirmPassword.jsx` | `components/` | `components/auth/` |
| `ButtonLoginGoogle.jsx` | `components/` | `components/auth/` |

### Home-specific Components → `components/home/`
Components only used by the Home page:

| File | From | To |
|------|------|----|
| `Hero.jsx` | `components/` | `components/home/` |
| `TopBooksShowcase.jsx` | `components/` | `components/home/` |

### Shared UI → `components/common/`
Reusable components shared across multiple pages:

| File | From | To |
|------|------|----|
| `BookCard.jsx` | `components/` | `components/common/` |
| `BookCarousel.jsx` | `components/` | `components/common/` |
| `SectionHeader.jsx` | `components/` | `components/common/` |
| `ThemeToggle.jsx` | `components/` | `components/common/` |
| `ScrollToTop.jsx` | `utils/` (was misplaced — it's a React component) | `components/common/` |

### Layout Component → `layouts/`

| File | From | To |
|------|------|----|
| `Footer.jsx` | `components/` | `layouts/` |

### Admin Sub-components → `components/admin/`
Were nested inside a page folder, should be in components:

| File | From | To |
|------|------|----|
| `StatCard.jsx` | `pages/Admin/components/` | `components/admin/` |
| `ListCard.jsx` | `pages/Admin/components/` | `components/admin/` |
| `ListItem.jsx` | `pages/Admin/components/` | `components/admin/` |

---

## 5. Import Updates

All import paths were updated across **~30 files** to reflect the new structure. Key changes:

- `../hook/useAuth` → `../hooks/useAuth` (13 files)
- `../hook/useTheme` → `../hooks/useTheme` (4 files)
- `../constant/routePath` → `../constants/routePaths` (6 files)
- `../layout/MainLayout` → `../layouts/MainLayout` (5 files)
- `../layout/AdminLayout` → `../layouts/AdminLayout` (7 files)
- `../components/BookCard` → `../components/common/BookCard` (5 files)
- `../components/BookCarousel` → `../components/common/BookCarousel` (2 files)
- `../components/SectionHeader` → `../components/common/SectionHeader` (4 files)
- `../services/bookFavorite` → `../services/favoriteService` (2 files)
- Various route guard, auth, home component imports updated

---

## 6. Final Project Structure

```
src/
├── App.jsx
├── App.css
├── main.jsx
├── index.css
│
├── assets/
│
├── components/
│   ├── account/          # Account management components
│   ├── admin/            # Admin dashboard components (incl. StatCard, ListCard, ListItem)
│   ├── auth/             # Authentication components (AuthModal, Login helpers)
│   ├── book-detail/      # Book detail page components
│   ├── common/           # Shared/reusable UI (BookCard, BookCarousel, SectionHeader, etc.)
│   ├── header/           # Header & navigation components
│   ├── home/             # Home page specific components (Hero, TopBooksShowcase)
│   ├── reader/           # EPUB reader components
│   └── routes/           # Route guards (AdminRoute, ProtectedRoute, UserRoute)
│
├── config/               # API configuration
│   └── ApiConfig.js
│
├── constants/            # App-wide constants
│   └── routePaths.js
│
├── contexts/             # React contexts & providers
│   ├── AuthContext.jsx
│   ├── AuthProvider.jsx
│   └── MessageProvider.jsx
│
├── hooks/                # Custom React hooks
│   ├── useAuth.jsx
│   └── useTheme.jsx
│
├── layouts/              # Layout components
│   ├── AdminLayout.jsx
│   ├── Footer.jsx
│   └── MainLayout.jsx
│
├── pages/                # Page-level components
│   ├── Home.jsx
│   ├── BookDetail.jsx
│   ├── CategoryBooks.jsx
│   ├── SearchResults.jsx
│   ├── Upload.jsx
│   ├── Admin/
│   ├── Auth/
│   ├── BookReader/
│   └── ManageAccount/
│
├── services/             # API service functions
│   ├── authService.js
│   ├── authorService.js
│   ├── bookmarkService.js
│   ├── bookService.js
│   ├── dashboardService.js
│   ├── favoriteService.js    (renamed from bookFavorite.js)
│   ├── genreService.js
│   ├── historyService.js
│   ├── manageBookService.js
│   ├── manageUserService.js
│   ├── ratingService.js
│   └── recommendationService.js
│
└── utils/                # Pure utility functions (no React components)
    ├── feedbackHelper.js
    ├── storage.js
    └── validatorInput.js
```

---

## 7. Build Verification

✅ `vite build` completes successfully with 0 errors after all changes.
