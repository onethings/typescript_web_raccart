/**
 * 裝置 Redux selector 相等性比較
 *
 * 自訂比較函式，只比對指定的裝置欄位以優化渲染效能。
 * 對應 FRONTME.md 13.4 deviceEquality 章節。
 */

import type { Device } from '../types/models';

/**
 * 建立裝置相等性比較函式
 * 只比對指定的欄位，忽略其他變更
 *
 * @param fields - 要比對的欄位名稱陣列
 * @returns (a: Device, b: Device) => boolean
 *
 * @example
 * const deviceEqualityByName = deviceEquality(['id', 'name']);
 * const devices = useSelector(state => state.devices.items, deviceEqualityByName);
 */
export const deviceEquality =
  (fields: (keyof Device)[]) =>
  (a?: Device, b?: Device): boolean => {
    if (a === b) return true;
    if (!a || !b) return false;
    return fields.every((field) => a[field] === b[field]);
  };
