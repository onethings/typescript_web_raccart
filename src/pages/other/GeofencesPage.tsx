/**
 * 圍欄列表與編輯頁面
 *
 * 左側顯示圍欄列表，右側地圖可視化編輯。
 * 支援 GPX 匯入、新增/編輯/刪除圍欄。
 * 對應 FRONTME.md 9.5 GeofencesPage 章節。
 */

import React, { useState, Fragment, useCallback } from 'react';
import {
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { makeStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { useCatch, useCatchCallback } from '../../hooks/useAsyncTask';
import { MapView } from '../../map/core/MapView';
import { MapGeofenceEdit } from '../../map/draw/MapGeofenceEdit';
import { MapOsmGeofenceSearch } from '../../map/draw/MapOsmGeofenceSearch';
import { MapScale } from '../../map/control/MapScale';
import { MapCurrentLocation } from '../../map/control/MapCurrentLocation';
import { MapGeocoder } from '../../map/control/MapGeocoder';
import { BackIcon } from '../../components/common/BackIcon';
import { CollectionActions } from '../../components/common/CollectionActions';
import { MapSwitcher } from '../../map/control/MapSwitcher';
import { MapRuler } from '../../map/control/MapRuler';
import { MapNotification } from '../../map/control/MapNotification';
import { useMapStyles } from '../../map/core/useMapStyles';
import { useAttributePreference } from '../../utils/preferences';
import { geofencesActions } from '../../store';
import { fetchOrThrow } from '../../utils/fetchOrThrow';
import { useTranslation } from '../../i18n/LocalizationProvider';

const DRAWER_WIDTH = 340;

const useStyles = makeStyles()((theme) => ({
  root: { height: '100%', display: 'flex', flexDirection: 'column' },
  content: {
    flexGrow: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse',
    },
  },
  drawer: {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('sm')]: {
      width: DRAWER_WIDTH,
    },
    [theme.breakpoints.down('sm')]: {
      height: theme.dimensions?.drawerHeightPhone || 200,
    },
  },
  mapContainer: { flexGrow: 1, position: 'relative' as const },
  title: { flexGrow: 1 },
  fileInput: { display: 'none' },
  list: { flexGrow: 1, overflow: 'auto' },
}));

/** 圍欄列表頁面 */
export const GeofencesPage: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const items = useAppSelector((state) => state.geofences.items);
  const [selectedGeofenceId, setSelectedGeofenceId] = useState<number | null>(null);

  const mapStyles = useMapStyles();
  const selectedMapStyle = useAttributePreference('selectedMapStyle', 'osm');

  const handleStyleSelect = (id: string) => {
    localStorage.setItem('selectedMapStyle', id);
    window.location.reload();
  };

  const geofenceList = Object.values(items);

  /** 重新載入圍欄 */
  const refreshGeofences = useCatchCallback(async () => {
    const response = await fetchOrThrow('/api/geofences');
    dispatch(geofencesActions.refresh(await response.json()));
  }, [dispatch]);

  /** 匯入 GPX 檔案 */
  const handleFile = useCatch(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const [file] = files;
    if (!file) return;

    const text = await file.text();
    const xml = new DOMParser().parseFromString(text, 'text/xml');
    const segment = xml.getElementsByTagName('trkseg')[0];
    if (segment) {
      const coordinates = Array.from(segment.getElementsByTagName('trkpt'))
        .map((point) => `${point.getAttribute('lat')} ${point.getAttribute('lon')}`)
        .join(', ');
      const area = `LINESTRING (${coordinates})`;
      const response = await fetchOrThrow('/api/geofences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: t('sharedGeofence'), area }),
      });
      const item = await response.json();
      navigate(`/settings/geofence/${item.id}`);
    }
  });

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        {/* 左側圍欄列表 */}
        <Paper square className={classes.drawer}>
          <Toolbar>
            <IconButton edge="start" sx={{ mr: 2 }} onClick={() => navigate(-1)}>
              <BackIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              {t('sharedGeofences')}
            </Typography>
            <label htmlFor="upload-gpx">
              <input
                accept=".gpx"
                id="upload-gpx"
                type="file"
                className={classes.fileInput}
                onChange={handleFile}
              />
              <IconButton edge="end" component="span">
                <Tooltip title={t('sharedUpload')}>
                  <UploadFileIcon />
                </Tooltip>
              </IconButton>
            </label>
          </Toolbar>
          <Divider />
          <List className={classes.list}>
            {geofenceList.map((item, index, list) => (
              <Fragment key={item.id}>
                <ListItemButton
                  selected={selectedGeofenceId === item.id}
                  onClick={() => setSelectedGeofenceId(item.id)}
                >
                  <ListItemText primary={item.name} />
                  <CollectionActions
                    editPath={`/settings/geofence/${item.id}`}
                    onDelete={async () => {
                      await fetchOrThrow(`/api/geofences/${item.id}`, { method: 'DELETE' });
                      refreshGeofences();
                    }}
                  />
                </ListItemButton>
                {index < list.length - 1 ? <Divider /> : null}
              </Fragment>
            ))}
            {geofenceList.length === 0 && (
              <ListItemButton disabled>
                <ListItemText primary={t('sharedGeofences')} secondary={t('sharedCreateGeofence')} />
              </ListItemButton>
            )}
          </List>
        </Paper>

        {/* 右側地圖 */}
        <div className={classes.mapContainer}>
          <MapView>
            <MapGeofenceEdit selectedGeofenceId={selectedGeofenceId} />
            <MapScale />
            <MapCurrentLocation />
          </MapView>
          <MapGeocoder />
          <MapSwitcher
            styles={mapStyles.map((s) => ({ id: s.id, name: s.name }))}
            selectedId={selectedMapStyle}
            onSelect={handleStyleSelect}
          />
          <MapRuler />
          <MapOsmGeofenceSearch />
          <MapNotification />
        </div>
      </div>
    </div>
  );
};
