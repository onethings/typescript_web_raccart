/**
 * Traccar API 客戶端
 * 
 * 基於 axios 的 API 客戶端，支援：
 * - 401 未授權自動處理（導向登入頁）
 * - 請求/回應攔截
 * - 統一錯誤處理
 * - 可中斷的請求 (AbortController)
 */

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';

// ==================== 型別定義 ====================

/** API 錯誤回應 */
export interface ApiError {
  /** 錯誤訊息 */
  message: string;
  /** HTTP 狀態碼 */
  status?: number;
  /** 錯誤代碼 */
  code?: string;
}

/** API 回應包裝 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

// ==================== 401 處理 ====================

/** 401 未授權回呼，由外部註冊 */
let onUnauthorized: (() => void) | null = null;

/**
 * 註冊 401 未授權處理函式
 * @param handler - 導向登入頁的函式
 */
export const setUnauthorizedHandler = (handler: () => void): void => {
  onUnauthorized = handler;
};

// ==================== Axios 實例 ====================

/** API 基底 URL，可由外部設定 */
const BASE_URL = '';

/**
 * 建立已設定的 Axios 實例
 * - 基底 URL 為空，使用 proxy 轉發
 * - 自動帶入憑證 (cookies)
 * - 請求/回應攔截器
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== 請求攔截器 ====================

/**
 * 請求攔截器
 * - 可在這裡加入 CSRF token 等
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 若是 FormData 請求，讓 axios 自動設定 Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// ==================== 回應攔截器 ====================

/**
 * 回應攔截器
 * - 401 未授權 → 觸發登出流程
 * - 網路錯誤 → 包裝為 ApiError
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 觸發 401 處理（導向登入頁）
      if (onUnauthorized) {
        onUnauthorized();
      }
    }

    // 包裝錯誤
    const apiError: ApiError = {
      message:
        (error.response?.data as string) ||
        error.message ||
        '發生未知錯誤',
      status: error.response?.status,
      code: error.code,
    };

    return Promise.reject(apiError);
  },
);

// ==================== 工具函式 ====================

/**
 * 建構查詢參數字串
 * @param params - 查詢參數物件
 * @returns URL 查詢字串
 * 
 * @example
 * buildQueryString({ from: '2024-01-01', to: '2024-01-02', type: ['a', 'b'] })
 * // => 'from=2024-01-01&to=2024-01-02&type=a&type=b'
 */
export const buildQueryString = (
  params: Record<string, string | number | boolean | string[] | number[] | undefined | null>,
): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else {
      searchParams.set(key, String(value));
    }
  });
  return searchParams.toString();
};

/**
 * 安全地執行 API 請求，統一處理錯誤
 * @param requestFn - 非同步請求函式
 * @returns ApiResponse 或 ApiError
 */
export const safeRequest = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>,
): Promise<ApiResponse<T>> => {
  try {
    const response = await requestFn();
    return {
      data: response.data,
      status: response.status,
      ok: true,
    };
  } catch (error) {
    const apiError = error as ApiError;
    throw apiError;
  }
};

/**
 * 從回應中取得文字（用於非 JSON 回應）
 * @param response - Axios 回應
 * @returns 文字內容
 */
export const getResponseText = (response: AxiosResponse): string => {
  if (typeof response.data === 'string') {
    return response.data;
  }
  return JSON.stringify(response.data);
};

export default apiClient;
