/**
 * 側邊導航選單項目
 * 對應 FRONTME.md 12.11 MenuItem 章節。
 */

import React from 'react';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface MenuItemProps {
  title: string;
  link: string;
  icon: React.ReactNode;
  selected?: boolean;
  external?: boolean;
}

/** 側邊導航項目 */
export const MenuItem: React.FC<MenuItemProps> = ({ title, link, icon, selected, external }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (external) {
      window.open(link, '_blank');
    } else {
      navigate(link);
    }
  };

  return (
    <ListItemButton selected={selected} onClick={handleClick}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={title} />
    </ListItemButton>
  );
};
