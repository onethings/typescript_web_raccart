/**
 * 圍欄編輯器頁面
 *
 * 視覺化圍欄編輯，支援地圖繪製與 GPX 匯入。
 * 對應 FRONTME.md 9.5 GeofencesPage 章節。
 */

import React, { useState, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { useCatch } from '../../hooks/useAsyncTask';
import { MapView } from '../../map/core/MapView';
import { MapGeofence } from '../../map/main/MapGeofence';
import { MapGeofenceEdit } from '../../map/draw/MapGeofenceEdit';
import { geofencesActions } from '../../store';
import { createGeofence, deleteGeofence } from '../../api/endpoints';

const DRAWER_WIDTH = 320;

const useStyles = makeStyles()((theme) => ({
  root: { height: '100%', display: 'flex', flexDirection: 'column' },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  listDrawer: {
    width: DRAWER_WIDTH,
    borderRight: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('md')]: { display: 'none' },
  },
  mapContainer: { flex: 1 },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
  },
  toolbar: { display: 'flex', gap: theme.spacing(1) },
}));

/** 圍欄編輯器頁面 */
export const GeofencesPage: React.FC = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const geofences = useAppSelector((state) => state.geofences.items);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const geofenceList = Object.values(geofences);

  /** 新增圍欄（建立一個空的然後導向編輯） */
  const handleAdd = useCatch(async () => {
    const res = await createGeofence({ name: 'New Geofence', area: 'POLYGON ((0 0, 0 1, 1 1, 1 0, 0 0))' });
    dispatch(geofencesActions.update([res.data]));
    navigate(`/settings/geofence/${res.data.id}`);
  });

  /** 刪除圍欄 */
  const handleDelete = useCatch(async (id: number) => {
    await deleteGeofence(id);
    dispatch(geofencesActions.update([])); // 觸發重新整理
    // 重新載入圍欄
    const res = await fetch('/api/geofences');
    const data = await res.json();
    dispatch(geofencesActions.refresh(data));
  });

  /** 匯入 GPX */
  const handleFileImport = useCatch(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    const trkpts = xml.querySelectorAll('trkpt');

    if (trkpts.length > 0) {
      const points = Array.from(trkpts).map((pt) => {
        const lat = pt.getAttribute('lat');
        const lon = pt.getAttribute('lon');
        return `${lat} ${lon}`;
      });

      const wkt = `LINESTRING (${points.join(', ')})`;
      const res = await createGeofence({ name: file.name.replace('.gpx', ''), area: wkt });
      dispatch(geofencesActions.update([res.data]));
      navigate(`/settings/geofence/${res.data.id}`);
    }
  });

  return (
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Geofence Editor</Typography>
          <div className={classes.toolbar}>
            <Button size="small" startIcon={<AddIcon />} variant="contained" onClick={handleAdd}>
              Add
            </Button>
            <Button
              size="small"
              startIcon={<FileUploadIcon />}
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
            >
              Import GPX
            </Button>
            <input ref={fileInputRef} type="file" accept=".gpx" hidden onChange={handleFileImport} />
          </div>
        </Toolbar>
      </AppBar>

      <div className={classes.body}>
        {/* 圍欄列表 */}
        <div className={classes.listDrawer}>
          <div className={classes.listHeader}>
            <Typography variant="subtitle2">{geofenceList.length} geofences</Typography>
          </div>
          <Divider />
          <List dense sx={{ flex: 1, overflow: 'auto' }}>
            {geofenceList.map((gf) => (
              <ListItemButton key={gf.id} onClick={() => navigate(`/settings/geofence/${gf.id}`)}>
                <ListItemText primary={gf.name} secondary={gf.area?.substring(0, 40)} />
                <IconButton
                  size="small"
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(gf.id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            ))}
            {geofenceList.length === 0 && (
              <ListItemButton disabled>
                <ListItemText primary="No geofences" secondary="Click Add to create one" />
              </ListItemButton>
            )}
          </List>
        </div>

        {/* 地圖 */}
        <div className={classes.mapContainer}>
          <MapView>
            <MapGeofence />
            <MapGeofenceEdit onEditNavigate={(id) => navigate(`/settings/geofence/${id}`)} />
          </MapView>
        </div>
      </div>
    </div>
  );
};
