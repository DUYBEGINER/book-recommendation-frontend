import { useMemo, useCallback, useState } from "react"
import { Breadcrumb } from "antd"
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom"
import { Menu, X } from "lucide-react"
import MainLayout from "../../layouts/MainLayout"
import AccountSidebar from "../../components/account/AccountSidebar"
import { PATHS } from "../../constants/routePaths"
import useAuth from "../../hooks/useAuth"

const TAB_CONFIG = {
  profile: { path: PATHS.MANAGE_ACCOUNT_REDIRECT.PROFILE, label: "Thông tin tài khoản" },
  "favorite-books": { path: PATHS.MANAGE_ACCOUNT_REDIRECT.FAVORITE_BOOKS, label: "Sách yêu thích" },
  "history-reading": { path: PATHS.MANAGE_ACCOUNT_REDIRECT.HISTORY_READING, label: "Lịch sử đọc sách" },
}

const PATH_TO_TAB = {
  [PATHS.MANAGE_ACCOUNT_REDIRECT.ROOT]: "profile",
  [PATHS.MANAGE_ACCOUNT_REDIRECT.PROFILE]: "profile",
  [PATHS.MANAGE_ACCOUNT_REDIRECT.FAVORITE_BOOKS]: "favorite-books",
  [PATHS.MANAGE_ACCOUNT_REDIRECT.HISTORY_READING]: "history-reading",
}

const ManageAccount = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const activeTab = PATH_TO_TAB[pathname] || "profile"
  const activeLabel = TAB_CONFIG[activeTab]?.label || ""

  const breadcrumbItems = useMemo(
    () => [
      {
        title: <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">Trang chủ</Link>,
      },
      {
        title: <span className="text-gray-800 font-medium">Quản lí tài khoản</span>,
      },
      {
        title: <span className="text-gray-800 font-medium">{activeLabel}</span>,
      },
    ],
    [activeLabel],
  )

  const handleTabChange = useCallback(
    (tab) => {
      const targetPath = TAB_CONFIG[tab]?.path
      if (targetPath && pathname !== targetPath) {
        navigate(targetPath)
        setIsMobileSidebarOpen(false)
      }
    },
    [pathname, navigate],
  )

  const handleSearchSubmit = useCallback(
    (keyword) => {
      const trimmed = keyword.trim()
      if (trimmed) {
        navigate(`/search?q=${encodeURIComponent(trimmed)}`)
      }
    },
    [navigate],
  )

  return (
    <MainLayout showHero={false} onSearchSubmit={handleSearchSubmit}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-3 sm:p-4 shadow-sm">
          <Breadcrumb separator=">" items={breadcrumbItems} />
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-2">
        <div className="bg-white shadow-sm rounded-lg relative">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden fixed bottom-6 right-6 z-50 bg-teal-500 text-white p-4 rounded-full shadow-lg hover:bg-teal-600 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {isMobileSidebarOpen && (
            <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileSidebarOpen(false)} />
          )}

          <div className="md:grid md:grid-cols-4 min-h-[calc(100vh-250px)] md:min-h-[calc(100vh-300px)]">
            <div
              className={`
                fixed md:static inset-y-0 left-0 z-40 w-64 md:w-auto
                transform transition-transform duration-300 ease-in-out
                ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                md:translate-x-0 md:col-span-1
                bg-white md:bg-transparent
              `}
            >
              <AccountSidebar user={user} activeTab={activeTab} onTabChange={handleTabChange} />
            </div>

            <div className="md:col-span-3">
              <div className="p-4 sm:p-6">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default ManageAccount
