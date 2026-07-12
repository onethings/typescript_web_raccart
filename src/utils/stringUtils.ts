/**
 * 字串工具函式
 * 
 * 對應 FRONTME.md 13.11 stringUtils.js 章節。
 */

/**
 * 為字串加上前綴並將值轉為駝峰
 * 如: prefixString('event', 'alarm') → 'eventAlarm'
 * 
 * @param prefix - 前綴
 * @param value - 要轉換的值
 * @returns 加上前綴的駝峰字串
 */
export const prefixString = (prefix: string, value: string): string => {
  return prefix + value.charAt(0).toUpperCase() + value.slice(1);
};

/**
 * 移除前綴並將結果轉回原始格式
 * 如: unprefixString('event', 'eventAlarm') → 'alarm'
 * 
 * @param prefix - 前綴
 * @param value - 要移除前綴的值
 * @returns 移除前綴後的字串
 */
export const unprefixString = (prefix: string, value: string): string => {
  if (value.startsWith(prefix)) {
    return value.charAt(prefix.length).toLowerCase() + value.slice(prefix.length + 1);
  }
  return value;
};
