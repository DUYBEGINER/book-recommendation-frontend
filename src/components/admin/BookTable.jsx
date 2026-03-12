"use client"
import { ConfigProvider, Table } from "antd"
import { Pencil, EyeOff } from "lucide-react"

const columns = [
  {
    title: "Tiêu đề",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "Tác giả",
    dataIndex: "author",
    key: "author",
  },
  {
    title: "Thể loại",
    dataIndex: "genres",
    key: "genres",
  },
  {
    title: "Nhà xuất bản",
    dataIndex: "publisher",
    key: "publisher",
  },
  {
    title: "Ngày tải lên",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (text) => <span className="text-teal-500 font-medium">{new Date(text).toLocaleDateString()}</span>,
  },
  {
    title: "Hành động",
    key: "action",
    render: (_, record) => (
      <div className="flex items-center gap-2">
        <button
          title = "Chỉnh sửa sách"
          onClick={() => record.onEdit(record.id)}
          className="p-2 text-orange-500 hover:bg-orange-50 rounded transition-colors"
          aria-label="Edit book"
        >
          <Pencil className="w-5 h-5" />
        </button>
        <button
          title = "Ẩn sách"
          onClick={() => record.onDelete(record.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
          aria-label="Hide book"
        
        >
          <EyeOff className="w-5 h-5" />
        </button>
      </div>
    ),
  },
]

const BookTable = ({
  books,
  onEdit,
  onDelete,
  pagination,
  onTableChange,
  loading: tableLoading,
  selectedRowKeys = [],
  onSelectionChange,
}) => {
  const rowSelection = onSelectionChange
    ? {
        selectedRowKeys,
        onChange: onSelectionChange,
      }
    : undefined

  const dataSource = books.map((book) => ({
    ...book,
    key: book.id,
    author: book.authors?.map(a => a.name).join(", ") || "-",  
    genres: book.genres?.map(g => g.name).join(", ") || "-",
    onEdit,
    onDelete,
  }))

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: "#E7E7E7 dark:#2A2A2A",
          },
        },
      }}
    >
      <Table
        rowSelection={rowSelection}
        pagination={pagination}
        onChange={onTableChange}
        loading={tableLoading}
        columns={columns}
        dataSource={dataSource}
        size="large"
      />
    </ConfigProvider>
  )
}

export default BookTable
