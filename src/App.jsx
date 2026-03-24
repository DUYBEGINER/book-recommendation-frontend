import "@ant-design/v5-patch-for-react-19"; // Temporary patch for React 19 compatibility
import "./App.css";
import Home from "./pages/Home.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import { Routes, Route } from "react-router-dom";

import { ConfigProvider, App as AntdApp, theme as antdTheme } from "antd";
import { useThemeContext } from "./hooks/useTheme";

import BookDetail from "./pages/BookDetail";
import CategoryBooks from "./pages/CategoryBooks";
import Membership from "./pages/Membership";

import AuthProvider from "./contexts/Auth/AuthProvider.jsx";
import { GenreProvider } from "./contexts/Genre/GenreProvider.jsx";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import AdminRoute from "./components/routes/AdminRoute";
import UserRoute from "./components/routes/UserRoute";

import ManageAccount from "./pages/ManageAccount/ManageAccount.jsx";
import AccountInfoSection from "./pages/ManageAccount/AccountInfoSection.jsx";
import FavoritesSection from "./pages/ManageAccount/FavoritesSection.jsx";
import HistorySection from "./pages/ManageAccount/HistorySection.jsx";
import { PATHS } from "./constants/routePaths.js";

import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import AdminUsers from "./pages/Admin/AdminUsers.jsx";
import AdminBooks from "./pages/Admin/AdminBooks.jsx";
import AdminAddBook from "./pages/Admin/AdminAddBook.jsx";
import AdminEditBook from "./pages/Admin/AdminEditBook.jsx";
import AdminDeletedBooks from "./pages/Admin/AdminDeletedBooks.jsx";
import AdminGenres from "./pages/Admin/AdminGenres.jsx";
import AdminRecommendation from "./pages/Admin/AdminRecommendation.jsx";
import OAuthRedirect from "./pages/Auth/OAuthRedirect.jsx";
import ResetPassword from "./pages/Auth/ResetPassword.jsx";
import ActivateAccount from "./pages/Auth/ActivateAccount.jsx";

import Upload from "./pages/Upload.jsx";

import EpubCoreViewer from "./pages/BookReader/BookReader.jsx";

//Devtools
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

function App() {
  const { isDark } = useThemeContext();

  return (
     <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GenreProvider>
          <ConfigProvider
            theme={{
              algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
            }}
          >
            <AntdApp>
              <Routes>
                {/* User Routes - Admin will be redirected to /admin */}
                <Route
                  path="/"
                  element={
                    <UserRoute>
                      <Home />
                    </UserRoute>
                  }
                />
              <Route
                path={PATHS.SEARCH}
                element={
                  <UserRoute>
                    <SearchResults />
                  </UserRoute>
                }
              />
              <Route
                path="/books/:id"
                element={
                  <UserRoute>
                    <BookDetail />
                  </UserRoute>
                }
              />
              <Route
                path={PATHS.CATEGORY}
                element={
                  <UserRoute>
                    <CategoryBooks />
                  </UserRoute>
                }
              />
              <Route
                path={PATHS.MEMBERSHIP}
                element={
                  <UserRoute>
                    <Membership />
                  </UserRoute>
                }
              />
              <Route
                path={PATHS.MANAGE_ACCOUNT_REDIRECT.ROOT}
                element={
                  <ProtectedRoute>
                    <ManageAccount />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AccountInfoSection />} />
                <Route
                  path={PATHS.MANAGE_ACCOUNT_CHILD.PROFILE}
                  element={<AccountInfoSection />}
                />
                <Route
                  path={PATHS.MANAGE_ACCOUNT_CHILD.FAVORITE_BOOKS}
                  element={<FavoritesSection />}
                />
                <Route
                  path={PATHS.MANAGE_ACCOUNT_CHILD.HISTORY_READING}
                  element={<HistorySection />}
                />
              </Route>

              {/* Admin Routes - Protected by AdminRoute */}
              <Route
                path={PATHS.ADMIN.ROOT}
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path={PATHS.ADMIN.USERS}
                element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                }
              />
              <Route
                path={PATHS.ADMIN.BOOKS}
                element={
                  <AdminRoute>
                    <AdminBooks />
                  </AdminRoute>
                }
              />
              <Route
                path={PATHS.ADMIN.ADD_BOOK}
                element={
                  <AdminRoute>
                    <AdminAddBook />
                  </AdminRoute>
                }
              />
              <Route
                path={PATHS.ADMIN.EDIT_BOOK}
                element={
                  <AdminRoute>
                    <AdminEditBook />
                  </AdminRoute>
                }
              />
              <Route
                path={PATHS.ADMIN.DELETED_BOOKS}
                element={
                  <AdminRoute>
                    <AdminDeletedBooks />
                  </AdminRoute>
                }
              />
              <Route
                path={PATHS.ADMIN.GENRES}
                element={
                  <AdminRoute>
                    <AdminGenres />
                  </AdminRoute>
                }
              />
              <Route
                path={PATHS.ADMIN.RECOMMENDATION}
                element={
                  <AdminRoute>
                    <AdminRecommendation />
                  </AdminRoute>
                }
              />

              {/* Other Routes */}
              <Route path="/oauth/callback" element={<OAuthRedirect />} />
              <Route path={PATHS.RESET_PASSWORD} element={<ResetPassword />} />
              <Route path="/activate-account" element={<ActivateAccount />} />
              <Route path="/reader" element={<EpubCoreViewer />} />
              <Route path="/upload" element={<Upload />} />
              </Routes>
            </AntdApp>
          </ConfigProvider>
        </GenreProvider>
      </AuthProvider>
       <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
