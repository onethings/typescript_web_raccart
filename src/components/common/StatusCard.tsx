/**
 * 可拖曳裝置狀態卡片
 *
 * 顯示裝置詳細資訊、圖片、狀態欄位、操作選單。
 * 對應 FRONTME.md 12.22 StatusCard 章節。
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  CardMedia,
  CardActions,
  Tooltip,
  Menu,
  MenuItem,
  Link,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import CloseIcon from '@mui/icons-material/Close';
import RouteIcon from '@mui/icons-material/Route';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PendingIcon from '@mui/icons-material/Pending';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { useAttributePreference } from '../../utils/preferences';
import { useCatch } from '../../hooks/useAsyncTask';
import { PositionValue } from './PositionValue';
import { RemoveDialog } from './RemoveDialog';
import { useDeviceReadonly, useRestriction } from '../../utils/permissions';
import { devicesActions } from '../../store';
import type { Position } from '../../types/models';

const useStyles = makeStyles()((theme) => ({
  root: {
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 5,
    left: '50%',
    bottom: theme.spacing(3),
    transform: 'translateX(-50%)',
  },
  card: { pointerEvents: 'auto', width: 288 },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 1, 0, 2),
    color: theme.palette.text.secondary,
  },
  content: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    maxHeight: '40vh',
    overflow: 'auto',
  },
  media: { height: 144 },
  cell: { borderBottom: 'none' },
  actions: { justifyContent: 'space-between' },
}));

interface StatusCardProps {
  deviceId: number;
  position?: Position;
  onClose: () => void;
  disableActions?: boolean;
  desktopPadding?: number;
}

/** 單一狀態列 */
const StatusRow: React.FC<{ name: string; content: React.ReactNode }> = ({ name, content }) => (
  <TableRow>
    <TableCell sx={{ borderBottom: 'none', paddingLeft: 0, paddingRight: 1 }}>
      <Typography variant="body2">{name}</Typography>
    </TableCell>
    <TableCell sx={{ borderBottom: 'none', paddingRight: 0 }}>
      <Typography variant="body2" color="textSecondary">{content}</Typography>
    </TableCell>
  </TableRow>
);

/**
 * 可拖曳裝置狀態卡片
 */
export const StatusCard: React.FC<StatusCardProps> = ({
  deviceId, position, onClose, disableActions = false, desktopPadding = 0,
}) => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const t = useTranslation();

  const device = useAppSelector((state) => state.devices.items[deviceId]);
  const readonly = useRestriction('readonly');
  const deviceReadonly = useDeviceReadonly();
  const shareDisabled = useAppSelector((state) => (state.session.server?.attributes as Record<string, unknown>)?.disableShare as boolean | undefined);

  const positionItems = useAttributePreference('positionItems', 'fixTime,address,speed,totalDistance');

  // 欄位 key → 翻譯 key 對映
  const fieldTranslationKey: Record<string, string> = {
    fixTime: 'positionFixTime',
    deviceTime: 'positionDeviceTime',
    serverTime: 'positionServerTime',
    latitude: 'positionLatitude',
    longitude: 'positionLongitude',
    speed: 'positionSpeed',
    course: 'positionCourse',
    altitude: 'positionAltitude',
    address: 'positionAddress',
    accuracy: 'positionAccuracy',
    valid: 'positionValid',
    totalDistance: 'deviceTotalDistance',
    odometer: 'positionOdometer',
    fuelLevel: 'positionFuelLevel',
    fuelConsumption: 'positionFuelConsumption',
    batteryLevel: 'positionBatteryLevel',
  };

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [removing, setRemoving] = useState(false);

  const deviceImage = (device?.attributes as Record<string, unknown> | undefined)?.deviceImage as string | undefined;

  const fields = positionItems.split(',').map((f) => f.trim()).filter(Boolean);

  /** 以位置建立圍欄 */
  const handleGeofence = useCatch(async () => {
    if (!position) return;
    const newItem = {
      name: t('sharedGeofence'),
      area: `CIRCLE (${position.latitude} ${position.longitude}, 50)`,
    };
    const res = await fetch('/api/geofences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    const item = await res.json();
    await fetch('/api/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: position.deviceId, geofenceId: item.id }),
    });
    navigate(`/settings/geofence/${item.id}`);
  });

  /** 刪除裝置 */
  const handleRemove = useCatch(async (removed: boolean) => {
    if (removed) {
      const res = await fetch('/api/devices');
      dispatch(devicesActions.refresh(await res.json()));
    }
    setRemoving(false);
  });

  if (!device) return null;

  return (
    <>
      <div className={classes.root}>
        <Rnd default={{ x: 0, y: 0, width: 'auto', height: 'auto' }} enableResizing={false} dragHandleClassName="draggable-header" style={{ position: 'relative' }}>
          <Card elevation={3} className={classes.card}>
            {/* Header with device image */}
            <CardMedia className={`draggable-header ${deviceImage ? classes.media : ''}`} image={deviceImage ? `/api/media/${device.uniqueId}/${deviceImage}` : undefined}>
              <div className={classes.header}>
                <Typography variant="body2" color="inherit">
                  {device.name}
                </Typography>
                <IconButton size="small" color="inherit" onClick={onClose}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
            </CardMedia>

            {/* Position fields */}
            {position && (
              <CardContent className={classes.content}>
                <Table size="small">
                  <TableBody>
                    {fields.map((field) => {
                      const displayName = t(fieldTranslationKey[field] || field);
                      const rawValue = (position as Record<string, unknown>)[field]
                        ?? (position.attributes as Record<string, unknown>)?.[field];
                      return (
                        <StatusRow
                          key={field}
                          name={displayName}
                          content={
                            <PositionValue field={field} value={rawValue} deviceId={deviceId} positionId={position.id} />
                          }
                        />
                      );
                    })}
                  </TableBody>
                  {/* Show details link */}
                  <tfoot>
                    <tr>
                      <td colSpan={2} style={{ padding: '4px 0' }}>
                        <Typography variant="body2">
                          <Link component="button" variant="body2" onClick={() => navigate(`/position/${position.id}`)}>
                            {t('sharedShowDetails')}
                          </Link>
                        </Typography>
                      </td>
                    </tr>
                  </tfoot>
                </Table>
              </CardContent>
            )}

            {/* Action buttons */}
            <CardActions className={classes.actions} disableSpacing>
              <Tooltip title={t('sharedExtra')}>
                <span>
                  <IconButton color="secondary" onClick={(e) => setAnchorEl(e.currentTarget)} disabled={!position}>
                    <PendingIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={t('reportReplay')}>
                <span>
                  <IconButton onClick={() => navigate(`/replay?deviceId=${deviceId}`)} disabled={disableActions || !position}>
                    <RouteIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={t('commandTitle')}>
                <span>
                  <IconButton onClick={() => navigate(`/settings/device/${deviceId}/command`)} disabled={disableActions}>
                    <SendIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={t('sharedEdit')}>
                <span>
                  <IconButton onClick={() => navigate(`/settings/device/${deviceId}`)} disabled={disableActions || deviceReadonly}>
                    <EditIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={t('sharedRemove')}>
                <span>
                  <IconButton color="error" onClick={() => setRemoving(true)} disabled={disableActions || deviceReadonly}>
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </CardActions>
          </Card>
        </Rnd>
      </div>

      {/* Extra menu */}
      {position && (
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem
            onClick={() => navigate(`/stream?deviceId=${deviceId}`)}
            disabled={position.protocol !== 'jt808'}
          >
            {t('linkLiveVideo')}
          </MenuItem>
          {!readonly && <MenuItem onClick={handleGeofence}>{t('sharedCreateGeofence')}</MenuItem>}
          <MenuItem component="a" target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`}>
            {t('linkGoogleMaps')}
          </MenuItem>
          <MenuItem component="a" target="_blank" href={`https://maps.apple.com/?ll=${position.latitude},${position.longitude}`}>
            {t('linkAppleMaps')}
          </MenuItem>
          <MenuItem component="a" target="_blank" href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.latitude}%2C${position.longitude}&heading=${position.course}`}>
            {t('linkStreetView')}
          </MenuItem>
        </Menu>
      )}

      {/* Delete confirmation */}
      <RemoveDialog open={removing} onClose={(removed) => handleRemove(removed)} />
    </>
  );
};
