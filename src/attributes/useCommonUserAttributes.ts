/**
 * 通用使用者屬性定義
 *
 * 40+ 種通用使用者屬性。
 * 對應 FRONTME.md 14.3 useCommonUserAttributes 章節。
 */

import type { AttributeDef } from './useDeviceAttributes';

export const useCommonUserAttributes = (): AttributeDef[] => [
  { key: 'language', name: 'Language', type: 'string' },
  { key: 'mapLiveRoutes', name: 'Live Routes', type: 'string' },
  { key: 'mapDirection', name: 'Map Direction', type: 'boolean' },
  { key: 'mapFollow', name: 'Follow Device', type: 'boolean' },
  { key: 'mapCluster', name: 'Cluster Markers', type: 'boolean' },
  { key: 'mapOnSelect', name: 'Auto-close on Select', type: 'boolean' },
  { key: 'activeMapStyles', name: 'Active Map Styles', type: 'string' },
  { key: 'devicePrimary', name: 'Device Primary Field', type: 'string' },
  { key: 'deviceSecondary', name: 'Device Secondary Field', type: 'string' },
  { key: 'soundEvents', name: 'Sound Events', type: 'string' },
  { key: 'soundAlarms', name: 'Sound Alarms', type: 'string' },
  { key: 'positionItems', name: 'Position Popup Fields', type: 'string' },
  { key: 'web.liveRouteLength', name: 'Live Route Length', type: 'number' },
  { key: 'mapLineWidth', name: 'Map Line Width', type: 'number' },
  { key: 'mapLineOpacity', name: 'Map Line Opacity', type: 'number' },
  { key: 'web.selectZoom', name: 'Select Zoom', type: 'number' },
  { key: 'web.maxZoom', name: 'Max Zoom', type: 'number' },
  { key: 'iconScale', name: 'Icon Scale', type: 'number' },
  { key: 'navigationAppLink', name: 'Navigation App Link', type: 'string' },
  { key: 'navigationAppTitle', name: 'Navigation App Title', type: 'string' },
  { key: 'googleKey', name: 'Google Maps Key', type: 'string' },
  { key: 'locationIqKey', name: 'LocationIQ Key', type: 'string' },
  { key: 'mapboxAccessToken', name: 'Mapbox Token', type: 'string' },
  { key: 'mapTilerKey', name: 'MapTiler Key', type: 'string' },
  { key: 'bingMapsKey', name: 'Bing Maps Key', type: 'string' },
  { key: 'openWeatherKey', name: 'OpenWeather Key', type: 'string' },
  { key: 'ordnanceSurveyKey', name: 'Ordnance Survey Key', type: 'string' },
  { key: 'tomTomKey', name: 'TomTom Key', type: 'string' },
  { key: 'hereKey', name: 'HERE Key', type: 'string' },
  { key: 'ui.disableSavedCommands', name: 'Disable Saved Commands', type: 'boolean' },
  { key: 'ui.disableAttributes', name: 'Disable Attributes', type: 'boolean' },
  { key: 'ui.disableDrivers', name: 'Disable Drivers', type: 'boolean' },
  { key: 'ui.disableMaintenance', name: 'Disable Maintenance', type: 'boolean' },
  { key: 'ui.disableGroups', name: 'Disable Groups', type: 'boolean' },
  { key: 'ui.disableEvents', name: 'Disable Events', type: 'boolean' },
  { key: 'ui.disableComputedAttributes', name: 'Disable Computed Attributes', type: 'boolean' },
  { key: 'ui.disableCalendars', name: 'Disable Calendars', type: 'boolean' },
];
