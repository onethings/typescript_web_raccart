/**
 * 事件詳情頁面（含地圖）
 *
 * 在地圖上顯示事件位置及相關資訊。
 * 對應 FRONTME.md 9.3 EventPage 章節。
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAsyncTask } from '../../hooks/useAsyncTask';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { MapView } from '../../map/core/MapView';
import { MapPositions } from '../../map/main/MapPositions';
import { MapCamera } from '../../map/main/MapCamera';
import { MapGeofence } from '../../map/main/MapGeofence';
import { MapAccuracy } from '../../map/main/MapAccuracy';
import { formatNotificationTitle, formatTime } from '../../utils/formatter';
import type { Event, Position } from '../../types/models';
import { getEvent, getPositions } from '../../api/endpoints';

/** 事件詳情頁面 */
export const EventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const [event, setEvent] = useState<Event | null>(null);
  const [position, setPosition] = useState<Position | null>(null);

  useAsyncTask(
    async ({ signal }) => {
      if (!id) return;
      const eventRes = await getEvent(Number(id));
      setEvent(eventRes.data);

      if (eventRes.data.positionId) {
        const posRes = await getPositions({ id: [eventRes.data.positionId] }, signal);
        if (posRes.data.length > 0) setPosition(posRes.data[0]);
      }
    },
    [id],
  );

  if (!event) return null;

  return (
    <>
      <AppBar position="static" color="default">
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">
            {formatNotificationTitle(t, event, true)}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* 地圖 */}
      <Paper sx={{ height: 300, mb: 2 }}>
        <MapView>
          <MapGeofence />
          {position && (
            <>
              <MapAccuracy position={position} />
              <MapPositions positions={[position]} />
              <MapCamera latitude={position.latitude} longitude={position.longitude} zoom={14} />
            </>
          )}
        </MapView>
      </Paper>

      {/* 事件詳情 */}
      <Container maxWidth="md">
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 500, width: 200 }}>Type</TableCell>
              <TableCell>{event.type}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Time</TableCell>
              <TableCell>{formatTime(event.eventTime)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Device ID</TableCell>
              <TableCell>{event.deviceId}</TableCell>
            </TableRow>
            {event.geofenceId && (
              <TableRow>
                <TableCell sx={{ fontWeight: 500 }}>Geofence ID</TableCell>
                <TableCell>{event.geofenceId}</TableCell>
              </TableRow>
            )}
            {event.attributes && Object.entries(event.attributes).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell sx={{ fontWeight: 500 }}>{key}</TableCell>
                <TableCell>{String(value)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Container>
    </>
  );
};
