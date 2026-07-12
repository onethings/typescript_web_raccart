/**
 * 地圖圖示預載入模組
 *
 * 預載所有裝置類別的 SVG 圖示，並使用 Canvas 渲染為 4 種顏色的地圖標記。
 * 對應 FRONTME.md 11.3 preloadImages 章節。
 */

import { grey } from '@mui/material/colors';
import { createTheme } from '@mui/material';
import { loadImage, prepareIcon } from './mapUtil';

// SVG imports (透過 vite-plugin-svgr 或直接 URL)
import directionSvg from '../../resources/images/direction.svg';
import backgroundSvg from '../../resources/images/background.svg';
import animalSvg from '../../resources/images/icon/animal.svg';
import bicycleSvg from '../../resources/images/icon/bicycle.svg';
import boatSvg from '../../resources/images/icon/boat.svg';
import busSvg from '../../resources/images/icon/bus.svg';
import carSvg from '../../resources/images/icon/car.svg';
import camperSvg from '../../resources/images/icon/camper.svg';
import craneSvg from '../../resources/images/icon/crane.svg';
import defaultSvg from '../../resources/images/icon/default.svg';
import startSvg from '../../resources/images/icon/start.svg';
import finishSvg from '../../resources/images/icon/finish.svg';
import helicopterSvg from '../../resources/images/icon/helicopter.svg';
import motorcycleSvg from '../../resources/images/icon/motorcycle.svg';
import personSvg from '../../resources/images/icon/person.svg';
import planeSvg from '../../resources/images/icon/plane.svg';
import scooterSvg from '../../resources/images/icon/scooter.svg';
import shipSvg from '../../resources/images/icon/ship.svg';
import tractorSvg from '../../resources/images/icon/tractor.svg';
import trailerSvg from '../../resources/images/icon/trailer.svg';
import trainSvg from '../../resources/images/icon/train.svg';
import tramSvg from '../../resources/images/icon/tram.svg';
import truckSvg from '../../resources/images/icon/truck.svg';
import vanSvg from '../../resources/images/icon/van.svg';

/** 所有裝置類別圖示映射表 */
export const mapIcons: Record<string, string> = {
  animal: animalSvg,
  bicycle: bicycleSvg,
  boat: boatSvg,
  bus: busSvg,
  car: carSvg,
  camper: camperSvg,
  crane: craneSvg,
  default: defaultSvg,
  finish: finishSvg,
  helicopter: helicopterSvg,
  motorcycle: motorcycleSvg,
  person: personSvg,
  plane: planeSvg,
  scooter: scooterSvg,
  ship: shipSvg,
  start: startSvg,
  tractor: tractorSvg,
  trailer: trailerSvg,
  train: trainSvg,
  tram: tramSvg,
  truck: truckSvg,
  van: vanSvg,
};

/** 根據 category 取得對應的圖示鍵名 */
export const mapIconKey = (category?: string): string => {
  switch (category) {
    case 'offroad':
    case 'pickup':
      return 'car';
    case 'trolleybus':
      return 'bus';
    default:
      return category && mapIcons.hasOwnProperty(category) ? category : 'default';
  }
};

/** 預載入的圖像資料（key: `${category}-${color}`） */
export const mapImages: Record<string, ImageData> = {};

const theme = createTheme({
  palette: {
    neutral: { main: grey[500] },
  },
});

/**
 * 預載入所有地圖圖示
 * 在應用啟動時呼叫一次
 */
export default async (): Promise<void> => {
  const background = await loadImage(backgroundSvg);
  mapImages.background = await prepareIcon(background);
  mapImages.direction = await prepareIcon(await loadImage(directionSvg));

  await Promise.all(
    Object.keys(mapIcons).map(async (category) => {
      const results: Promise<void>[] = [];
      ['info', 'success', 'error', 'neutral'].forEach((color) => {
        results.push(
          loadImage(mapIcons[category]).then((icon) => {
            mapImages[`${category}-${color}`] = prepareIcon(
              background,
              icon,
              theme.palette[color as 'info' | 'success' | 'error' | 'neutral'].main,
            );
          }),
        );
      });
      await Promise.all(results);
    }),
  );
};
