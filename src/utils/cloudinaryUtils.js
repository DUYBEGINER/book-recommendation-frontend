/**
 * Cloudinary Image Optimization Utilities
 *
 * Tối ưu hóa ảnh từ Cloudinary với các transformations:
 * - f_auto: Tự động chọn format tốt nhất (webp, avif, etc.)
 * - q_auto: Tự động tối ưu quality
 * - w_: Resize theo width
 * - c_limit: Giữ nguyên aspect ratio, không phóng to quá kích thước gốc
 * - dpr_auto: Tự động điều chỉnh Device Pixel Ratio
 */

const CLOUDINARY_PATTERN = /^https?:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(.*)/;

/**
 * Kiểm tra xem URL có phải là Cloudinary URL không
 * @param {string} url
 * @returns {boolean}
 */
export const isCloudinaryUrl = (url) => {
  return url && CLOUDINARY_PATTERN.test(url);
};

/**
 * Transform Cloudinary URL với các tối ưu hóa
 * @param {string} url - URL gốc từ Cloudinary
 * @param {Object} options - Các tùy chọn transform
 * @param {number} options.width - Width mong muốn
 * @param {number} options.height - Height mong muốn
 * @param {string} options.quality - Quality (auto, auto:low, auto:eco, auto:good, auto:best)
 * @param {string} options.format - Format (auto, webp, avif, jpg, png)
 * @param {string} options.crop - Crop mode (limit, fill, fit, scale, thumb)
 * @param {boolean} options.blur - Thêm blur effect (cho placeholder)
 * @param {number} options.blurAmount - Độ blur (1-2000)
 * @returns {string} URL đã transform
 */
export const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!url || !isCloudinaryUrl(url)) {
    return url;
  }

  const {
    width,
    height,
    quality = "auto",
    format = "auto",
    crop = "limit",
    blur = false,
    blurAmount = 1000,
  } = options;

  // Build transformation string
  const transforms = [];

  // Format và quality
  transforms.push(`f_${format}`);
  transforms.push(`q_${quality}`);

  // Crop mode
  transforms.push(`c_${crop}`);

  // Dimensions
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);

  // Blur cho placeholder
  if (blur) transforms.push(`e_blur:${blurAmount}`);

  const transformString = transforms.join(",");

  // Insert transforms vào URL
  return url.replace(
    CLOUDINARY_PATTERN,
    `https://res.cloudinary.com/$1/image/upload/${transformString}/$2`
  );
};

/**
 * Tạo srcset cho responsive images
 * @param {string} url - URL gốc từ Cloudinary
 * @param {number[]} widths - Mảng các width
 * @param {Object} options - Các tùy chọn khác
 * @returns {string} srcset string
 */
export const generateSrcSet = (url, widths = [320, 480, 640, 800, 1024], options = {}) => {
  if (!url || !isCloudinaryUrl(url)) {
    return "";
  }

  return widths
    .map((w) => {
      const optimizedUrl = optimizeCloudinaryUrl(url, { ...options, width: w });
      return `${optimizedUrl} ${w}w`;
    })
    .join(", ");
};

/**
 * Tạo URL placeholder với blur effect và kích thước nhỏ
 * @param {string} url - URL gốc
 * @param {number} width - Width của placeholder (mặc định 20px)
 * @returns {string} URL placeholder
 */
export const getPlaceholderUrl = (url, width = 20) => {
  return optimizeCloudinaryUrl(url, {
    width,
    quality: "auto:low",
    blur: true,
    blurAmount: 1000,
  });
};

/**
 * Preset configurations cho các use cases phổ biến
 */
export const CLOUDINARY_PRESETS = {
  // Ảnh bìa sách - chi tiết
  bookCover: {
    width: 400,
    quality: "auto:good",
    format: "auto",
    crop: "limit",
  },
  // Ảnh bìa sách - thumbnail
  bookThumbnail: {
    width: 200,
    quality: "auto",
    format: "auto",
    crop: "limit",
  },
  // Ảnh bìa sách - card nhỏ
  bookCard: {
    width: 280,
    quality: "auto",
    format: "auto",
    crop: "limit",
  },
  // Background blur (desktop)
  backgroundBlur: {
    width: 100,
    quality: "auto:low",
    format: "auto",
    blur: true,
    blurAmount: 2000,
  },
  // Background mobile (không blur, chất lượng thấp)
  backgroundMobile: {
    width: 1100,
    quality: "auto",
    format: "auto",
    crop: "fill",
  },
  // Avatar
  avatar: {
    width: 100,
    height: 100,
    quality: "auto",
    format: "auto",
    crop: "fill",
  },
  // Avatar lớn
  avatarLarge: {
    width: 200,
    height: 200,
    quality: "auto:good",
    format: "auto",
    crop: "fill",
  },
};

/**
 * Helper function để apply preset
 * @param {string} url
 * @param {string} presetName
 * @returns {string}
 */
export const applyPreset = (url, presetName) => {
  const preset = CLOUDINARY_PRESETS[presetName];
  if (!preset) {
    console.warn(`Cloudinary preset "${presetName}" not found`);
    return url;
  }
  return optimizeCloudinaryUrl(url, preset);
};
