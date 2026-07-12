/**
 * 表格列操作按鈕
 *
 * 桌機版顯示工具列按鈕，手機版顯示選單。
 * 對應 FRONTME.md 7.19 CollectionActions 章節。
 */

import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';

export interface ActionItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

interface CollectionActionsProps {
  /** 編輯路徑 */
  editPath: string;
  /** 刪除回呼 */
  onDelete?: () => void;
  /** 自訂操作 */
  customActions?: ActionItem[];
}

/** 集合操作按鈕 */
export const CollectionActions: React.FC<CollectionActionsProps> = ({
  editPath,
  onDelete,
  customActions = [],
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (desktop) {
    return (
      <>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => navigate(editPath)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {customActions.map((action) => (
          <Tooltip key={action.key} title={action.label}>
            <IconButton size="small" onClick={action.onClick}>
              {action.icon}
            </IconButton>
          </Tooltip>
        ))}
        {onDelete && (
          <Tooltip title="Delete">
            <IconButton size="small" onClick={onDelete}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </>
    );
  }

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => { setAnchorEl(null); navigate(editPath); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        {customActions.map((action) => (
          <MenuItem key={action.key} onClick={() => { setAnchorEl(null); action.onClick(); }}>
            <ListItemIcon>{action.icon}</ListItemIcon>
            <ListItemText>{action.label}</ListItemText>
          </MenuItem>
        ))}
        {onDelete && (
          <MenuItem onClick={() => { setAnchorEl(null); onDelete(); }}>
            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
