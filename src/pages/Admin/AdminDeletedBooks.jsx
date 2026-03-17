"use client"
import { useState, useEffect, useRef } from "react"
import AdminLayout from "../../layouts/AdminLayout"
import SearchBar from "../../components/admin/SearchBar"
import SortSelect from "../../components/admin/SortSelect"
import { ConfigProvider, Modal, Table, message } from "antd"
import { Trash2, Eye } from "lucide-react"
import { getDeletedBooks, hardDeleteBook, restoreBook } from "../../services/manageBookService"

const SORT_OPTIONS = [
  { value: "newest", label: "Xóa gần nhất" },
  { value: "oldest", label: "Xóa cũ nhất" },
  { value: "title-asc", label: "Tên A-Z" },
  { value: "title-desc", label: "Tên Z-A" },
]

const columns = (onDelete, onRestore) => [
  {
    title: "Tiêu đề",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "Tác giả",
    dataIndex: "authors",
    key: "authors",
    render: (authors) => authors?.map((a) => a.name).join(", ") || "-",
  },
  {
    title: "Thể loại",
    dataIndex: "genres",
    key: "genres",
    render: (genres) => genres?.map((g) => g.name).join(", ") || "-",
  },
  {
    title: "Nhà xuất bản",
    dataIndex: "publisher",
    key: "publisher",
    render: (text) => text || "-",
  },
  {
    title: "Ngày ẩn",
    dataIndex: "deletedAt",
    key: "deletedAt",
    render: (text) => (
      <span className="text-red-500 font-medium">
        {text ? new Date(text).toLocaleDateString("vi-VN") : "-"}
      </span>
    ),
  },
  {
    title: "Hành động",
    key: "action",
    render: (_, record) => (
      <div className="flex items-center gap-1">
        <button
          title="Bỏ ẩn sách"
          onClick={() => onRestore(record.id)}
          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
          aria-label="Restore book"
        >
          <Eye className="w-5 h-5" />
        </button>
        <button
          title="Xóa vĩnh viễn sách"
          onClick={() => onDelete(record.id)}
          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          aria-label="Permanently delete book"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    ),
  },
]

const AdminDeletedBooks = () => {
  const [bookData, setBookData] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [loading, setLoading] = useState(false)
  const [bookToDelete, setBookToDelete] = useState(null)
  const [bookToRestore, setBookToRestore] = useState(null)
  const searchInitialized = useRef(false)
  const sortInitialized = useRef(false)

  const fetchBooks = async (
    page = 0,
    size = pagination.pageSize,
    keywordParam = searchQuery,
    sortParam = sortBy
  ) => {
    setLoading(true)
    try {
      const response = await getDeletedBooks({ page, size, keyword: keywordParam, sort: sortParam })
      const data = response.data || response
      const content = data?.content || []
      setBookData(content)
      setPagination({
        current: (data?.number ?? page) + 1,
        pageSize: data?.size ?? size,
        total: data?.totalElements ?? 0,
      })
    } catch (error) {
      console.error("Error fetching deleted books:", error)
      message.error("Không thể tải danh sách sách đã ẩn")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks(0, pagination.pageSize, searchQuery, sortBy)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!searchInitialized.current) {
      searchInitialized.current = true
      return
    }
    const handler = setTimeout(() => {
      fetchBooks(0, pagination.pageSize, searchQuery, sortBy)
    }, 400)
    return () => clearTimeout(handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  useEffect(() => {
    if (!sortInitialized.current) {
      sortInitialized.current = true
      return
    }
    fetchBooks(0, pagination.pageSize, searchQuery, sortBy)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy])

  const handleTableChange = (paginationConfig) => {
    fetchBooks(paginationConfig.current - 1, paginationConfig.pageSize, searchQuery, sortBy)
  }

  const confirmDelete = async () => {
    if (!bookToDelete) return
    try {
      await hardDeleteBook(bookToDelete)
      message.success("Đã xóa vĩnh viễn sách thành công!")

      const totalAfterDelete = Math.max(0, pagination.total - 1)
      const maxPageIndex = Math.max(0, Math.ceil(totalAfterDelete / pagination.pageSize) - 1)
      const nextPage = Math.min(pagination.current - 1, maxPageIndex)

      await fetchBooks(nextPage, pagination.pageSize, searchQuery, sortBy)
      setBookToDelete(null)
    } catch (error) {
      message.error("Xóa vĩnh viễn sách thất bại!")
      console.error("Error hard deleting book:", error)
    }
  }

  const confirmRestore = async () => {
    if (!bookToRestore) return
    try {
      await restoreBook(bookToRestore)
      message.success("Đã bỏ ẩn sách thành công!")

      const totalAfterRestore = Math.max(0, pagination.total - 1)
      const maxPageIndex = Math.max(0, Math.ceil(totalAfterRestore / pagination.pageSize) - 1)
      const nextPage = Math.min(pagination.current - 1, maxPageIndex)

      await fetchBooks(nextPage, pagination.pageSize, searchQuery, sortBy)
      setBookToRestore(null)
    } catch (error) {
      message.error("Bỏ ẩn sách thất bại!")
      console.error("Error restoring book:", error)
    }
  }

  const paginationConfig = {
    ...pagination,
    position: ["bottomCenter"],
    showSizeChanger: false,
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sách`,
  }

  const dataSource = bookData.map((book) => ({ ...book, key: book.id }))

  return (
    <AdminLayout title="ADMIN">
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
            Sách đã ẩn
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Danh sách các sách đã bị ẩn. Xóa vĩnh viễn sẽ xóa hoàn toàn khỏi cơ sở dữ liệu.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <SortSelect
            value={sortBy}
            onChange={setSortBy}
            options={SORT_OPTIONS}
            placeholder="Sắp xếp theo"
          />
        </div>

        <ConfigProvider
          theme={{ components: { Table: { headerBg: "#E7E7E7 dark:#2A2A2A" } } }}
        >
          <Table
            columns={columns(setBookToDelete, setBookToRestore)}
            dataSource={dataSource}
            pagination={paginationConfig}
            onChange={handleTableChange}
            loading={loading}
            size="large"
          />
        </ConfigProvider>
      </div>

      <Modal
        title="Xóa vĩnh viễn sách"
        open={!!bookToDelete}
        onOk={confirmDelete}
        onCancel={() => setBookToDelete(null)}
        okText="Xóa vĩnh viễn"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        centered
      >
        <p>
          Bạn có chắc muốn <strong>xóa vĩnh viễn</strong> cuốn sách này?
          Hành động này không thể hoàn tác và sẽ xóa toàn bộ dữ liệu liên quan.
        </p>
      </Modal>

      <Modal
        title="Bỏ ẩn sách"
        open={!!bookToRestore}
        onOk={confirmRestore}
        onCancel={() => setBookToRestore(null)}
        okText="Bỏ ẩn"
        cancelText="Hủy"
        centered
      >
        <p>
          Bạn có chắc muốn <strong>bỏ ẩn</strong> cuốn sách này?
          Sách sẽ hiển thị lại cho người dùng trên hệ thống.
        </p>
      </Modal>
    </AdminLayout>
  )
}

export default AdminDeletedBooks
