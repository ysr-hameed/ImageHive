// API Configuration - Easy to modify for different servers
export const API_CONFIG = {
  BASE_URL: '',  // Will use relative URLs for same-origin requests
  ENDPOINTS: {
    AUTH: '/api/auth',
    IMAGES: '/api/v1/images',
    API_KEYS: '/api/v1/api-keys',
    ANALYTICS: '/api/v1/analytics',
    USERS: '/api/v1/users',
  },
  UPLOAD: {
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
    CHUNK_SIZE: 1024 * 1024, // 1MB chunks for large file uploads
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  CACHE: {
    STALE_TIME: 5 * 60 * 1000, // 5 minutes
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000,
  },
};

// Feature flags for easy enabling/disabling
export const FEATURES = {
  BULK_UPLOAD: true,
  IMAGE_EDITING: true,
  CDN_OPTIMIZATION: true,
  REAL_TIME_ANALYTICS: true,
  ADMIN_PANEL: true,
  API_RATE_LIMITING: true,
  IMAGE_COMPRESSION: true,
  WATERMARKING: false,
  SOCIAL_SHARING: true,
  CUSTOM_DOMAINS: true,
};

// UI Configuration
export const UI_CONFIG = {
  THEME: {
    DEFAULT: 'light',
    STORAGE_KEY: 'imageVault-theme',
  },
  SIDEBAR: {
    DEFAULT_COLLAPSED: false,
    MOBILE_BREAKPOINT: 768,
  },
  ANIMATIONS: {
    ENABLED: true,
    DURATION: 200,
  },
  GRID: {
    DEFAULT_COLUMNS: {
      mobile: 2,
      tablet: 3,
      desktop: 4,
      wide: 5,
    },
  },
};

// Performance settings
export const PERFORMANCE = {
  LAZY_LOADING: true,
  IMAGE_OPTIMIZATION: true,
  PREFETCH_IMAGES: true,
  VIRTUAL_SCROLLING: true,
  DEBOUNCE_SEARCH: 300,
  THROTTLE_SCROLL: 100,
};

// Error messages
export const ERRORS = {
  NETWORK: 'Network error occurred. Please check your connection.',
  UNAUTHORIZED: 'Please sign in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  UPLOAD_FAILED: 'Upload failed. Please try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'This file type is not supported.',
  QUOTA_EXCEEDED: 'Storage quota exceeded. Please upgrade your plan.',
};

export default {
  API_CONFIG,
  FEATURES,
  UI_CONFIG,
  PERFORMANCE,
  ERRORS,
};