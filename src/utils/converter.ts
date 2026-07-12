/**
 * 單位轉換工具
 * 
 * 支援速度、距離、海拔、容量的單位轉換。
 * 對應 FRONTME.md 13.2 converter.js 章節。
 */

import type { SpeedUnit, DistanceUnit, AltitudeUnit, VolumeUnit } from '../types/ui';

// ==================== 輔助 ====================

const roundFloat = (value: number): number => Number(value.toPrecision(12));

// ==================== 速度轉換 ====================

const speedConverter = (unit: SpeedUnit): number => {
  switch (unit) {
    case 'kmh':
      return 1.852;
    case 'mph':
      return 1852 / 1609.344;
    case 'kn':
    default:
      return 1;
  }
};

/** 從 knots 轉換到指定單位 */
export const speedFromKnots = (value: number, unit: SpeedUnit): number =>
  roundFloat(value * speedConverter(unit));

/** 從指定單位轉換回 knots */
export const speedToKnots = (value: number, unit: SpeedUnit): number =>
  value / speedConverter(unit);

// ==================== 距離轉換 ====================

const distanceConverter = (unit: DistanceUnit): number => {
  switch (unit) {
    case 'mi':
      return 1 / 1609.344;
    case 'nmi':
      return 1 / 1852;
    case 'km':
    default:
      return 0.001;
  }
};

/** 從公尺轉換到指定單位 */
export const distanceFromMeters = (value: number, unit: DistanceUnit): number =>
  roundFloat(value * distanceConverter(unit));

/** 從指定單位轉換回公尺 */
export const distanceToMeters = (value: number, unit: DistanceUnit): number =>
  value / distanceConverter(unit);

// ==================== 海拔轉換 ====================

const altitudeConverter = (unit: AltitudeUnit): number => {
  switch (unit) {
    case 'ft':
      return 1 / 0.3048;
    case 'm':
    default:
      return 1;
  }
};

/** 從公尺轉換到指定單位 */
export const altitudeFromMeters = (value: number, unit: AltitudeUnit): number =>
  roundFloat(value * altitudeConverter(unit));

/** 從指定單位轉換回公尺 */
export const altitudeToMeters = (value: number, unit: AltitudeUnit): number =>
  value / altitudeConverter(unit);

// ==================== 容量轉換 ====================

const volumeConverter = (unit: VolumeUnit): number => {
  switch (unit) {
    case 'impGal':
      return 4.54609;
    case 'usGal':
      return 3.785411784;
    case 'ltr':
    default:
      return 1;
  }
};

/** 從公升轉換到指定單位 */
export const volumeFromLiters = (value: number, unit: VolumeUnit): number =>
  roundFloat(value / volumeConverter(unit));

/** 從指定單位轉換回公升 */
export const volumeToLiters = (value: number, unit: VolumeUnit): number =>
  value * volumeConverter(unit);
// ==================== 單位字串 ====================

/** 速度單位標籤 */
export const speedUnitString = (unit: SpeedUnit, t: (key: string) => string): string => {
  switch (unit) {
    case 'kmh':
      return t('sharedKmh') || 'km/h';
    case 'mph':
      return t('sharedMph') || 'mph';
    case 'kn':
    default:
      return t('sharedKn') || 'kn';
  }
};