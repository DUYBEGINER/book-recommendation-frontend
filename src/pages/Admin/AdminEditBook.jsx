import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  message,
  ConfigProvider,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Camera, File } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { PATHS } from "../../constants/routePaths";
import { getBookDetail, updateBook } from "../../services/manageBookService";
import { getGenres } from "../../services/genreService";

const { TextArea } = Input;
const { Option } = Select;

const COVER_MAX_MB = 5;
const FILE_MAX_MB = 25;

// ── File-validation helpers ────────────────────────────────────────────
const validateCoverImage = (file) => {
  if (!file.type.startsWith("image/")) {
    message.error("Chỉ được tải lên file ảnh!");
    return false;
  }
  if (file.size / 1024 / 1024 >= COVER_MAX_MB) {
    message.error(`Ảnh phải nhỏ hơn ${COVER_MAX_MB}MB!`);
    return false;
  }
  return true;
};

const validatePdf = (file) => {
  const isPdf =
    file.type === "application/pdf" ||
    file.name?.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    message.error("Chỉ được tải lên file PDF!");
    return false;
  }
  if (file.size / 1024 / 1024 >= FILE_MAX_MB) {
    message.error(`File phải nhỏ hơn ${FILE_MAX_MB}MB!`);
    return false;
  }
  return true;
};

const validateEpub = (file) => {
  const isEpub =
    file.type === "application/epub+zip" ||
    file.type === "application/octet-stream" ||
    file.name?.toLowerCase().endsWith(".epub");
  if (!isEpub) {
    message.error("Chỉ được tải lên file EPUB!");
    return false;
  }
  if (file.size / 1024 / 1024 >= FILE_MAX_MB) {
    message.error(`File phải nhỏ hơn ${FILE_MAX_MB}MB!`);
    return false;
  }
  return true;
};

// ── Upload theme override (shared by both dragger zones) ───────────────
const uploadThemeOverride = {
  components: {
    Upload: {
      colorFillAlter: "#accee72b",
      controlOutline: "rgba(241, 163, 99, 0.25)",
    },
  },
};

// ── Component ──────────────────────────────────────────────────────────
const AdminEditBook = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();

  const [coverPreview, setCoverPreview] = useState(null);
  const [initialCoverUrl, setInitialCoverUrl] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [epubFile, setEpubFile] = useState(null);
  const [existingFormats, setExistingFormats] = useState([]);

  const [genreOptions, setGenreOptions] = useState([]);
  const [genresLoading, setGenresLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ── Load book + genres on mount ────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setGenresLoading(true);
      try {
        const [{ genres }, book] = await Promise.all([
          getGenres({ size: 100 }).catch(() => ({ genres: [] })),
          getBookDetail(id),
        ]);

        setGenreOptions(
          genres.map((g) => ({ id: g.genreId, name: g.genreName })),
        );

        if (book) {
          const authorNames = book.authors
            ? book.authors.map((a) => a.authorName)
            : [];
          const genreIds = book.genres
            ? book.genres.map((g) => g.genreId)
            : [];

          form.setFieldsValue({
            title: book.title,
            author: authorNames.join(", "),
            publisher: book.publisher,
            publicationYear: book.publicationYear,
            genres: genreIds,
            description: book.description,
          });

          setExistingFormats(book.formats ?? []);
          setInitialCoverUrl(book.coverImageUrl || null);
          setCoverPreview(book.coverImageUrl || null);
        }
      } catch {
        message.error("Không thể tải thông tin sách!");
      } finally {
        setGenresLoading(false);
        setLoading(false);
      }
    };

    loadData();
  }, [id, form]);

  // ── Upload handlers (stable refs via useCallback) ──────────────────
  const handleCoverImageUpload = useCallback((file) => {
    if (!validateCoverImage(file)) return false;
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview(e.target.result);
    reader.readAsDataURL(file);
    setCoverFile(file);
    return false;
  }, []);

  const handlePdfUpload = useCallback((file) => {
    if (!validatePdf(file)) return false;
    setPdfFile(file);
    return false;
  }, []);

  const handleEpubUpload = useCallback((file) => {
    if (!validateEpub(file)) return false;
    setEpubFile(file);
    return false;
  }, []);

  const handleRemoveCoverImage = useCallback(() => {
    setCoverFile(null);
    setCoverPreview(initialCoverUrl);
  }, [initialCoverUrl]);

  const handleRemovePdfFile = useCallback(() => setPdfFile(null), []);
  const handleRemoveEpubFile = useCallback(() => setEpubFile(null), []);

  // ── Submit ─────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (values) => {
      const authorNames = values.author
        ?.split(",")
        .map((n) => n.trim())
        .filter(Boolean);

      if (!authorNames?.length) {
        message.error("Vui lòng nhập ít nhất một tác giả!");
        return;
      }
      if (!values.genres?.length) {
        message.error("Vui lòng chọn thể loại!");
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title.trim());
      formData.append("description", values.description.trim());
      if (values.publicationYear) formData.append("publicationYear", values.publicationYear);
      if (values.publisher) formData.append("publisher", values.publisher.trim());

      authorNames.forEach((name) => formData.append("authorNames", name));
      values.genres.forEach((gid) => formData.append("genreIds", gid));

      if (coverFile) formData.append("cover", coverFile);
      if (pdfFile) formData.append("pdfFile", pdfFile);
      if (epubFile) formData.append("epubFile", epubFile);

      setSubmitting(true);
      try {
        const response = await updateBook(id, formData);
        message.success(response.message || "Cập nhật sách thành công!");
        navigate(PATHS.ADMIN.BOOKS);
      } catch (error) {
        message.error(
          error.response?.data?.message || "Không thể cập nhật sách, vui lòng thử lại!",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [id, coverFile, pdfFile, epubFile, navigate],
  );

  // ── Loading state ──────────────────────────────────────────────────
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl dark:text-gray-300">Đang tải...</div>
        </div>
      </AdminLayout>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <div className="min-h-screen bg-white dark:bg-gray-900 max-w-7xl mx-auto">
        {/* Header */}
        <div className="grid grid-cols-3 items-center border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="justify-self-start inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeftOutlined className="text-lg" />
          </button>

          <h1 className="justify-self-center text-3xl font-bold text-[#4B69B1] dark:text-blue-400">
            Sửa sách
          </h1>

          <div />
        </div>

        {/* Form Content */}
        <div className="sm:px-6 lg:px-8 py-6">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Column - Book Information */}
            <div className="lg:col-span-2 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-blue-400 mb-6">
                Thông tin sách
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Book Title */}
                <Form.Item
                  name="title"
                  label={<span className="text-gray-700 dark:text-gray-300 font-medium">Tên sách</span>}
                  rules={[{ required: true, message: "Vui lòng nhập tên sách" }]}
                  className="mb-4"
                >
                  <Input placeholder="Clean code" className="rounded-lg" size="large" />
                </Form.Item>

                {/* Author */}
                <Form.Item
                  name="author"
                  label={<span className="text-gray-700 dark:text-gray-300 font-medium">Tác giả</span>}
                  rules={[{ required: true, message: "Vui lòng nhập tác giả" }]}
                  className="mb-4"
                >
                  <Input placeholder="Robert C. Martin" className="rounded-lg" size="large" />
                </Form.Item>

                {/* Publisher */}
                <Form.Item
                  name="publisher"
                  label={<span className="text-gray-700 dark:text-gray-300 font-medium">Nhà xuất bản</span>}
                  rules={[{ required: true, message: "Vui lòng nhập nhà xuất bản" }]}
                  className="mb-4"
                >
                  <Input placeholder="NXB Dân Trí" className="rounded-lg" size="large" />
                </Form.Item>

                {/* Publication Year */}
                <Form.Item
                  name="publicationYear"
                  label={<span className="text-gray-700 dark:text-gray-300 font-medium">Năm xuất bản</span>}
                  rules={[{ required: true, message: "Vui lòng nhập năm xuất bản" }]}
                  className="mb-4"
                >
                  <Input placeholder="2022" className="rounded-lg" size="large" type="number" />
                </Form.Item>
              </div>

              {/* Genre */}
              <Form.Item
                name="genres"
                label={<span className="text-gray-700 dark:text-gray-300 font-medium">Thể loại</span>}
                rules={[{ required: true, message: "Vui lòng chọn thể loại" }]}
                className="mb-4"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn thể loại"
                  className="rounded-lg"
                  size="large"
                  loading={genresLoading}
                  tagRender={(props) => {
                    const { label, closable, onClose } = props;
                    return (
                      <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md mr-2">
                        {label}
                        {closable && (
                          <CloseCircleOutlined
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 cursor-pointer"
                          />
                        )}
                      </span>
                    );
                  }}
                >
                  {genreOptions.map((genre) => (
                    <Option key={genre.id} value={genre.id}>
                      {genre.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Description */}
              <Form.Item
                name="description"
                label={<span className="text-gray-700 dark:text-gray-300 font-medium">Mô tả</span>}
                rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                className="mb-4"
              >
                <TextArea
                  rows={6}
                  placeholder="Clean code (mã sạch) là cách viết mã nguồn rõ ràng, dễ đọc, dễ hiểu và dễ bảo trì..."
                  className="rounded-lg"
                />
              </Form.Item>

              {/* Book File Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* PDF upload */}
                <div className="space-y-4 flex flex-col flex-1 gap-2">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium">
                    Tải sách (PDF)
                  </label>
                  <ConfigProvider theme={uploadThemeOverride}>
                    <Upload.Dragger beforeUpload={handlePdfUpload} showUploadList={false}>
                      <div className="py-8">
                        <p className="text-gray-600 dark:text-gray-300 mb-2">Kéo thả file hoặc chọn</p>
                        <p className="text-gray-400 dark:text-gray-300 text-sm">
                          Format: pdf &amp; Max file size: {FILE_MAX_MB} MB
                        </p>
                      </div>
                    </Upload.Dragger>
                  </ConfigProvider>

                  {pdfFile ? (
                    <div className="flex items-center justify-between bg-blue-100 dark:bg-gray-600 p-3 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-blue-600 text-2xl"><File /></span>
                        <span className="text-gray-700 dark:text-gray-300 truncate">{pdfFile.name}</span>
                      </div>
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={handleRemovePdfFile} />
                    </div>
                  ) : (
                    existingFormats
                      .filter((f) => f.typeName?.toUpperCase() === "PDF")
                      .map((f) => (
                        <div key={f.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex items-center gap-2">
                          <span className="text-blue-600 text-2xl"><File /></span>
                          <div>
                            <p className="text-gray-700 dark:text-gray-300 font-medium">{f.typeName}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              {f.fileSizeKb ? `${f.fileSizeKb} KB` : "File đã được tải lên"}
                            </p>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {/* EPUB upload */}
                <div className="space-y-4 flex flex-col flex-1 gap-2">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium">
                    Tải sách (EPUB)
                  </label>
                  <ConfigProvider theme={uploadThemeOverride}>
                    <Upload.Dragger beforeUpload={handleEpubUpload} showUploadList={false}>
                      <div className="py-8">
                        <p className="text-gray-600 dark:text-gray-300 mb-2">Kéo thả file hoặc chọn</p>
                        <p className="text-gray-400 dark:text-gray-300 text-sm">
                          Format: epub &amp; Max file size: {FILE_MAX_MB} MB
                        </p>
                      </div>
                    </Upload.Dragger>
                  </ConfigProvider>

                  {epubFile ? (
                    <div className="flex items-center justify-between bg-blue-100 dark:bg-gray-600 p-3 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-blue-600 text-2xl"><File /></span>
                        <span className="text-gray-700 dark:text-gray-300 truncate">{epubFile.name}</span>
                      </div>
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={handleRemoveEpubFile} />
                    </div>
                  ) : (
                    existingFormats
                      .filter((f) => f.typeName?.toUpperCase() === "EPUB")
                      .map((f) => (
                        <div key={f.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex items-center gap-2">
                          <span className="text-blue-600 text-2xl"><File /></span>
                          <div>
                            <p className="text-gray-700 dark:text-gray-300 font-medium">{f.typeName}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              {f.fileSizeKb ? `${f.fileSizeKb} KB` : "File đã được tải lên"}
                            </p>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="lg:col-span-3 flex justify-end gap-3">
                <Button
                  size="large"
                  onClick={() => navigate(PATHS.ADMIN.BOOKS)}
                  className="mt-26 rounded-lg px-12 py-2 h-auto text-base font-medium"
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="mt-26 bg-teal-500 hover:bg-teal-600 border-none rounded-lg px-12 py-2 h-auto text-base font-medium"
                  loading={submitting}
                >
                  Cập nhật sách
                </Button>
              </div>
            </div>

            {/* Right Column - Cover Image */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sticky top-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-300 mb-4">
                  Ảnh bìa
                </h2>
                <Upload.Dragger
                  beforeUpload={handleCoverImageUpload}
                  showUploadList={false}
                  className="rounded-lg"
                >
                  {coverPreview ? (
                    <div className="relative">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-80 object-cover rounded-lg"
                      />
                      <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCoverImage();
                        }}
                        className="absolute top-2 right-2"
                      >
                        Xóa
                      </Button>
                    </div>
                  ) : (
                    <div className="py-20">
                      <div className="text-gray-300 text-6xl mb-4">
                        <Camera className="mx-auto" size={48} />
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">Tải ảnh lên</p>
                    </div>
                  )}
                </Upload.Dragger>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEditBook;
