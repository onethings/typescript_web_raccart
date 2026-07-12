/**
 * 裝置屬性定義
 *
 * 7 種裝置層級的自訂屬性。
 * 對應 FRONTME.md 14.1 useDeviceAttributes 章節。
 */

export interface AttributeDef {
  key: string;
  name: string;
  type: 'string' | 'number' | 'boolean';
}

/** 裝置屬性命題 */
export const useDeviceAttributes = (): AttributeDef[] => {
  return [
    { key: 'command.sender', name: 'Command Sender', type: 'string' },
    { key: 'web.reportColor', name: 'Report Color', type: 'string' },
    { key: 'devicePassword', name: 'Device Password', type: 'string' },
    { key: 'deviceImage', name: 'Device Image', type: 'string' },
    { key: 'processing.copyAttributes', name: 'Copy Attributes', type: 'boolean' },
    { key: 'decoder.timezone', name: 'Decoder Timezone', type: 'string' },
    { key: 'forward.url', name: 'Forward URL', type: 'string' },
  ];
};
