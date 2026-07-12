/**
 * 安全 fetch 包裝
 *
 * 包裝 fetch API，在非 OK 回應時 throw Error。
 * 對應 FRONTME.md 13.7 fetchOrThrow.js 章節。
 */

/**
 * fetch 包裝函式，非 OK 回應時 throw Error
 *
 * @param url - 請求 URL
 * @param options - fetch 選項
 * @returns Response（僅在狀態 OK 時）
 * @throws Error 包含回應文字
 *
 * @example
 * const response = await fetchOrThrow('/api/devices', { signal });
 * const data = await response.json();
 */
export const fetchOrThrow = async (
  url: string,
  options?: RequestInit,
): Promise<Response> => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(message || response.statusText);
  }
  return response;
};
