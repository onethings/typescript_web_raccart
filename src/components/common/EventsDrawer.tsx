/**
 * 事件抽屜元件
 *
 * 即時事件列表，可刪除、導向事件詳情。
 * 對應 FRONTME.md 6.1 EventsDrawer 章節。
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { makeStyles } from 'tss-react/mui';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { eventsActions } from '../../store';
import { formatNotificationTitle, formatTime } from '../../utils/formatter';

const useStyles = makeStyles()((theme) => ({
  drawer: { width: 320 },
  toolbar: { paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) },
  title: { flexGrow: 1 },
  delete: { opacity: 0.5 },
}));

interface EventsDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * 事件抽屜
 * 顯示即時事件通知列表
 */
export const EventsDrawer: React.FC<EventsDrawerProps> = ({ open, onClose }) => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const t = useTranslation();

  const devices = useAppSelector((state) => state.devices.items);
  const events = useAppSelector((state) => state.events.items);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Toolbar className={classes.toolbar} disableGutters>
        <Typography variant="h6" className={classes.title}>
          {t('reportEvents')}
        </Typography>
        <IconButton size="small" color="inherit" onClick={() => dispatch(eventsActions.deleteAll())}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Toolbar>
      <List className={classes.drawer} dense>
        {events.map((event) => (
          <ListItemButton
            key={event.id}
            onClick={() => navigate(`/event/${event.id}`)}
            disabled={!event.id}
          >
            <ListItemText
              primary={`${devices[event.deviceId!]?.name || `Device #${event.deviceId}`} • ${formatNotificationTitle(t, event)}`}
              secondary={formatTime(event.eventTime, 'seconds')}
            />
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                dispatch(eventsActions.delete(event));
              }}
            >
              <DeleteIcon fontSize="small" className={classes.delete} />
            </IconButton>
          </ListItemButton>
        ))}
        {events.length === 0 && (
          <ListItemButton disabled>
            <ListItemText primary="No events" secondary="Events will appear here in real-time" />
          </ListItemButton>
        )}
      </List>
    </Drawer>
  );
};
