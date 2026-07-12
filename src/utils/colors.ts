/**
 * Turbo colormap 色彩工具
 *
 * 用於速度著色路線等視覺化功能。
 * 對應 FRONTME.md 13.1 colors 章節。
 */

/**
 * Turbo colormap 多項式插值
 * 將 0-1 的標準化值映射到 turbo 色譜的 RGB
 */
const turboPolynomials = {
  r: (t: number): number => {
    return (
      0.1357 + 4.5974 * t - 42.6153 * t ** 2 + 130.1355 * t ** 3 -
      150.1089 * t ** 4 + 63.456 * t ** 5
    );
  },
  g: (t: number): number => {
    return (
      0.0914 + 2.1855 * t + 11.9478 * t ** 2 - 51.3926 * t ** 3 +
      67.8424 * t ** 4 - 26.7892 * t ** 5
    );
  },
  b: (t: number): number => {
    return (
      0.6261 + 33.8196 * t - 178.1235 * t ** 2 + 292.2575 * t ** 3 -
      195.1502 * t ** 4 + 48.7851 * t ** 5
    );
  },
};

/**
 * 根據速度值取得 turbo 色譜中的顏色
 *
 * @param speed - 目前速度
 * @param minSpeed - 最小速度
 * @param maxSpeed - 最大速度
 * @returns CSS 顏色字串
 *
 * @example
 * getSpeedColor(50, 0, 100) // => 'rgb(120, 180, 50)'
 */
export const getSpeedColor = (
  speed: number,
  minSpeed: number,
  maxSpeed: number,
): string => {
  const range = maxSpeed - minSpeed;
  if (range <= 0) return 'rgb(0, 0, 0)';

  // 標準化 0-1
  const t = Math.max(0, Math.min(1, (speed - minSpeed) / range));

  const r = Math.round(turboPolynomials.r(t));
  const g = Math.round(turboPolynomials.g(t));
  const b = Math.round(turboPolynomials.b(t));

  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Turbo colormap 插值
 * 將 0-1 的標準化值映射到 turbo 色譜的 [r, g, b] 陣列（各 0-255）
 *
 * @param t - 標準化值 (0 ~ 1)
 * @returns [r, g, b] 陣列
 */
export const interpolateTurbo = (t: number): [number, number, number] => {
  const r = Math.round(turboPolynomials.r(t));
  const g = Math.round(turboPolynomials.g(t));
  const b = Math.round(turboPolynomials.b(t));
  return [r, g, b];
};
