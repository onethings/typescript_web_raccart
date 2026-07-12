/**
 * 裝置類別列表
 *
 * 對應 FRONTME.md 13.3 deviceCategories 章節。
 */

/** 所有可用的裝置類別 */
export const DEVICE_CATEGORIES = [
  'default',
  'animal',
  'bicycle',
  'boat',
  'bus',
  'car',
  'camper',
  'crane',
  'helicopter',
  'motorcycle',
  'person',
  'plane',
  'scooter',
  'ship',
  'tractor',
  'trailer',
  'train',
  'tram',
  'truck',
  'van',
] as const;

/** 裝置類別型別 */
export type DeviceCategory = (typeof DEVICE_CATEGORIES)[number];
