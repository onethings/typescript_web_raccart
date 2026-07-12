/**
 * 速度色階圖例元件
 *
 * 在地圖上顯示速度色階的漸層條與數值範圍。
 * 對應 FRONTME.md 11.6 MapSpeedLegend 章節。
 */

import React, { useEffect } from 'react';
import { useTheme } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import maplibregl from 'maplibre-gl';
import { useMap } from '../core/MapView';
import { interpolateTurbo } from '../../utils/colors';
import { speedFromKnots, speedUnitString } from '../../utils/converter';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { useAttributePreference } from '../../utils/preferences';
import type { Position } from '../../types/models';

const gradientStops = Array.from({ length: 10 }, (_, i) => {
  const [r, g, b] = interpolateTurbo(i / 9);
  return `rgb(${r}, ${g}, ${b})`;
}).join(', ');

const useStyles = makeStyles()(() => ({
  colorBar: {
    background: `linear-gradient(to right, ${gradientStops})`,
    height: 10,
  },
}));

interface MapSpeedLegendProps {
  positions: Position[];
}

/**
 * 速度色階圖例
 * 顯示最小/最大速度與對應的色階條
 */
export const MapSpeedLegend: React.FC<MapSpeedLegendProps> = ({ positions }) => {
  const theme = useTheme();
  const t = useTranslation();
  const { map } = useMap();
  const speedUnit = useAttributePreference('speedUnit', 'kn');
  const { classes } = useStyles();

  useEffect(() => {
    if (!positions.length) return;

    const maxSpeed = positions.reduce((a, p) => Math.max(a, p.speed ?? 0), -Infinity);
    const minSpeed = positions.reduce((a, p) => Math.min(a, p.speed ?? 0), Infinity);
    if (!maxSpeed) return;

    let container: HTMLDivElement | undefined;
    const control: maplibregl.IControl = {
      onAdd: () => {
        container = document.createElement('div');
        container.className = 'maplibregl-ctrl maplibregl-ctrl-scale';
        const colorBar = document.createElement('div');
        colorBar.className = classes.colorBar;
        const label = document.createElement('span');
        const min = Math.round(speedFromKnots(minSpeed, speedUnit));
        const max = Math.round(speedFromKnots(maxSpeed, speedUnit));
        label.textContent = `${min} - ${max} ${speedUnitString(speedUnit, t)}`;
        container.appendChild(colorBar);
        container.appendChild(label);
        return container;
      },
      onRemove: () => container?.remove(),
    };

    map.addControl(control, theme.direction === 'rtl' ? 'bottom-right' : 'bottom-left');
    return () => { try { map.removeControl(control); } catch { /* ignore */ } };
  }, [positions, speedUnit, t, theme.direction, classes.colorBar, map]);

  return null;
};
