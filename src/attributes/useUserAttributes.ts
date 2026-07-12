/**
 * 使用者屬性定義
 *
 * 18 種使用者層級屬性。
 * 對應 FRONTME.md 14.4 useUserAttributes 章節。
 */

import type { AttributeDef } from './useDeviceAttributes';

export const useUserAttributes = (): AttributeDef[] => [
  { key: 'telegramChatId', name: 'Telegram Chat ID', type: 'string' },
  { key: 'notificator.telegram.sendLocation', name: 'Telegram Send Location', type: 'boolean' },
  { key: 'pushoverUserKey', name: 'Pushover User Key', type: 'string' },
  { key: 'pushoverDeviceNames', name: 'Pushover Device Names', type: 'string' },
  { key: 'mail.smtp.host', name: 'SMTP Host', type: 'string' },
  { key: 'mail.smtp.port', name: 'SMTP Port', type: 'number' },
  { key: 'mail.smtp.starttls', name: 'SMTP STARTTLS', type: 'boolean' },
  { key: 'mail.smtp.ssl', name: 'SMTP SSL', type: 'boolean' },
  { key: 'mail.smtp.from', name: 'SMTP From', type: 'string' },
  { key: 'mail.smtp.auth', name: 'SMTP Auth', type: 'boolean' },
  { key: 'mail.smtp.username', name: 'SMTP Username', type: 'string' },
  { key: 'mail.smtp.password', name: 'SMTP Password', type: 'string' },
  { key: 'termsAccepted', name: 'Terms Accepted', type: 'boolean' },
  { key: 'billingLink', name: 'Billing Link', type: 'string' },
];
