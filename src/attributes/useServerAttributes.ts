/**
 * 伺服器屬性定義
 *
 * 19 種伺服器層級的自訂屬性。
 * 對應 FRONTME.md 14.8 useServerAttributes 章節。
 */

import type { AttributeDef } from './useDeviceAttributes';

/** 伺服器屬性 */
export const useServerAttributes = (): AttributeDef[] => [
  { key: 'support', name: 'Support Link', type: 'string' },
  { key: 'title', name: 'Page Title', type: 'string' },
  { key: 'description', name: 'Page Description', type: 'string' },
  { key: 'logo', name: 'Logo URL', type: 'string' },
  { key: 'logoInverted', name: 'Logo Inverted URL', type: 'string' },
  { key: 'colorPrimary', name: 'Primary Color', type: 'string' },
  { key: 'colorSecondary', name: 'Secondary Color', type: 'string' },
  { key: 'disableChange', name: 'Disable Server Change', type: 'boolean' },
  { key: 'darkMode', name: 'Dark Mode', type: 'boolean' },
  { key: 'termsUrl', name: 'Terms URL', type: 'string' },
  { key: 'privacyUrl', name: 'Privacy URL', type: 'string' },
  { key: 'totpEnable', name: 'Enable TOTP', type: 'boolean' },
  { key: 'totpForce', name: 'Force TOTP', type: 'boolean' },
  { key: 'serviceWorkerUpdateInterval', name: 'SW Update Interval (ms)', type: 'number' },
  { key: 'ui.disableLoginLanguage', name: 'Disable Login Language', type: 'boolean' },
  { key: 'disableShare', name: 'Disable Sharing', type: 'boolean' },
];
