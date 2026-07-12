/**
 * 指令屬性定義
 *
 * 25+ 種指令類型的屬性定義。
 * 對應 FRONTME.md 14.9 useCommandAttributes 章節。
 */

import type { AttributeDef } from './useDeviceAttributes';

/**
 * 指令類型對應的屬性定義
 * 回傳特定指令類型所需的屬性欄位
 */
export const useCommandAttributes = (_t: (key: string) => string): Record<string, AttributeDef[]> => ({
  custom: [{ key: 'data', name: 'Data', type: 'string' }],
  positionPeriodic: [{ key: 'frequency', name: 'Frequency (seconds)', type: 'number' }],
  setTimezone: [{ key: 'timezone', name: 'Timezone', type: 'string' }],
  sendSms: [{ key: 'message', name: 'Message', type: 'string' }],
  message: [{ key: 'message', name: 'Message', type: 'string' }],
  sendUssd: [{ key: 'message', name: 'Message', type: 'string' }],
  sosNumber: [{ key: 'data', name: 'SOS Number', type: 'string' }],
  silenceTime: [{ key: 'data', name: 'Silence Time', type: 'string' }],
  setPhonebook: [{ key: 'data', name: 'Phonebook', type: 'string' }],
  voiceMessage: [{ key: 'data', name: 'Message', type: 'string' }],
  outputControl: [
    { key: 'index', name: 'Output Index', type: 'number' },
    { key: 'data', name: 'Value', type: 'string' },
  ],
  voiceMonitoring: [{ key: 'data', name: 'Data', type: 'string' }],
  setAgps: [],
  setIndicator: [{ key: 'data', name: 'Data', type: 'string' }],
  configuration: [{ key: 'data', name: 'Configuration', type: 'string' }],
  setConnection: [{ key: 'data', name: 'Connection String', type: 'string' }],
  setOdometer: [{ key: 'data', name: 'Odometer (km)', type: 'number' }],
  modePowerSaving: [],
  modeDeepSleep: [],
  alarmGeofence: [],
  alarmBattery: [],
  alarmSos: [],
  alarmRemove: [],
  alarmClock: [{ key: 'data', name: 'Time', type: 'string' }],
  alarmSpeed: [{ key: 'data', name: 'Speed (kn)', type: 'number' }],
  engineStop: [],
  engineResume: [],
  doorLock: [],
  doorUnlock: [],
  relayOn: [],
  relayOff: [],
  arm: [],
  disarm: [],
  setHome: [{ key: 'data', name: 'Location', type: 'string' }],
  park: [],
  videoStart: [{ key: 'channel', name: 'Channel', type: 'number' }],
  videoStop: [{ key: 'channel', name: 'Channel', type: 'number' }],
});
