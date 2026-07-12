/**
 * 原生 App 橋接介面
 *
 * 處理與 iOS/Android 原生應用的通訊。
 * 支援登入 Token、推播通知註冊。
 * 對應 FRONTME.md 12.12 NativeInterface 章節。
 */

/** 原生環境偵測 */
export const nativeEnvironment = !!(
  (window as unknown as Record<string, unknown>).webkit ||
  (window as unknown as Record<string, unknown>).appInterface
);

/** 登入 Token 監聽器 */
export const handleLoginTokenListeners = new Set<(token: string) => void>();

/**
 * 向原生 App 發送訊息
 *
 * @param message - 訊息字串
 */
export const nativePostMessage = (message: string): void => {
  const win = window as unknown as Record<string, unknown>;

  // iOS
  if (win.webkit && (win.webkit as Record<string, unknown>).messageHandlers) {
    const handler = (win.webkit as Record<string, unknown>).messageHandlers as Record<
      string,
      { postMessage: (msg: string) => void }
    >;
    if (handler.appInterface) {
      handler.appInterface.postMessage(message);
    }
  }
  // Android
  else if (win.appInterface && typeof (win.appInterface as { postMessage?: (msg: string) => void }).postMessage === 'function') {
    (win.appInterface as { postMessage: (msg: string) => void }).postMessage(message);
  }
};

/**
 * 處理登入 Token（由原生 App 呼叫）
 *
 * @param token - 登入 Token 字串
 */
export const handleLoginToken = (token: string): void => {
  handleLoginTokenListeners.forEach((listener) => listener(token));
};

/**
 * 產生登入 Token
 * 向伺服器請求 6 個月有效的 Token
 */
export const generateLoginToken = async (): Promise<void> => {
  try {
    const expiration = new Date();
    expiration.setMonth(expiration.getMonth() + 6);

    const response = await fetch('/api/session/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ expiration: expiration.toISOString() }),
    });

    if (response.ok) {
      const token = await response.text();
      nativePostMessage(`token|${token}`);
    }
  } catch {
    // 忽略 Token 產生錯誤
  }
};

/**
 * 註冊推播通知 Token
 *
 * @param token - 推播通知 Token
 * @param userId - 使用者 ID
 */
export const registerNotificationToken = async (
  token: string,
  userId: number,
): Promise<void> => {
  try {
    // 從 localStorage 取得已儲存的 notificationToken
    const savedToken = window.localStorage.getItem('notificationToken');

    if (savedToken === token) return;

    // 更新使用者屬性的 notificationTokens
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) return;

    const user = await response.json();
    const existingTokens =
      (user.attributes?.notificationTokens as string)?.split(',').filter(Boolean) || [];

    if (!existingTokens.includes(token)) {
      existingTokens.push(token);
      await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...user,
          attributes: {
            ...user.attributes,
            notificationTokens: existingTokens.join(','),
          },
        }),
      });
    }

    window.localStorage.setItem('notificationToken', token);
  } catch {
    // 忽略註冊錯誤
  }
};
