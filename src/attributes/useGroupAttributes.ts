/**
 * 群組屬性定義
 *
 * 2 種群組層級屬性。
 * 對應 FRONTME.md 14.6 useGroupAttributes 章節。
 */

import type { AttributeDef } from './useDeviceAttributes';

export const useGroupAttributes = (): AttributeDef[] => [
  { key: 'processing.copyAttributes', name: 'Copy Attributes', type: 'boolean' },
  { key: 'decoder.timezone', name: 'Decoder Timezone', type: 'string' },
];
