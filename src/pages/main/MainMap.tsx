/**
 * 主地圖組合元件
 *
 * 整合所有地圖子元件：位置標記、圍欄、即時軌跡、鏡頭控制。
 * 對應 FRONTME.md 4.3 MainMap 章節。
 */

import React, { useCallback } from 'react';
import { useAppDispatch } from '../../hooks/useAppStore';
import { devicesActions } from '../../store';
import { MapView } from '../../map/core/MapView';
import { MapPositions } from '../../map/main/MapPositions';
import { MapGeofence } from '../../map/main/MapGeofence';
import { MapLiveRoutes } from '../../map/main/MapLiveRoutes';
import { MapCamera } from '../../map/main/MapCamera';
import { MapAccuracy } from '../../map/main/MapAccuracy';
import { MapDefaultCamera } from '../../map/main/MapDefaultCamera';
import { MapSelectedDevice } from '../../map/main/MapSelectedDevice';
import { MapOverlay } from '../../map/main/MapOverlay';
import { PoiMap } from '../../map/main/PoiMap';
import { MapScale } from '../../map/control/MapScale';
import { MapCurrentLocation } from '../../map/control/MapCurrentLocation';
import { MapSwitcher } from '../../map/control/MapSwitcher';
import { MapRuler } from '../../map/control/MapRuler';
import { MapNotification } from '../../map/control/MapNotification';
import { MapGeocoder } from '../../map/control/MapGeocoder';
import { useMapStyles } from '../../map/core/useMapStyles';
import { useAttributePreference } from '../../utils/preferences';
import type { Position } from '../../types/models';

interface MainMapProps {
  filteredPositions: Position[];
  selectedPosition?: Position;
  onEventsClick: () => void;
}

/**
 * 主地圖
 * 組合所有地圖子元件
 */
export const MainMap: React.FC<MainMapProps> = ({
  filteredPositions,
  selectedPosition,
  onEventsClick,
}) => {
  const dispatch = useAppDispatch();

  const onMarkerClick = useCallback(
    (_positionId: number, deviceId: number) => {
      dispatch(devicesActions.selectId(deviceId));
    },
    [dispatch],
  );

  const styles = useMapStyles();
  const selectedMapStyle = useAttributePreference('selectedMapStyle', 'osm');

  const handleStyleSelect = (id: string) => {
    localStorage.setItem('selectedMapStyle', id);
    window.location.reload();
  };

  return (
    <MapView>
      <MapGeofence />
      <MapAccuracy position={selectedPosition} />
      <MapDefaultCamera />
      <MapSelectedDevice />
      <MapOverlay />
      <PoiMap />
      <MapLiveRoutes deviceIds={filteredPositions.map((p) => p.deviceId)} />
      <MapPositions
        positions={filteredPositions}
        onMarkerClick={onMarkerClick}
        selectedPosition={selectedPosition}
        showStatus
      />
      <MapCamera positions={filteredPositions} />
      <MapScale />
      <MapCurrentLocation />
      <MapGeocoder />
      <MapSwitcher
        styles={styles.map((s) => ({ id: s.id, name: s.name }))}
        selectedId={selectedMapStyle}
        onSelect={handleStyleSelect}
      />
      <MapRuler />
      <MapNotification onToggle={(enabled) => console.debug('[MapNotification] enabled:', enabled)} />
    </MapView>
  );
};
