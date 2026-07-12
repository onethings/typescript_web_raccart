/**
 * 側邊導航元件
 *
 * 從路由設定陣列產生側邊導航。
 * 對應 FRONTME.md 12.20 SideNav 章節。
 */

import React from 'react';
import { List, ListSubheader, Divider } from '@mui/material';
import { MenuItem } from './MenuItem';

/** 導航項目定義 */
export interface NavItem {
  /** 標題 */
  title: string;
  /** 連結路徑 */
  link: string;
  /** 圖示 */
  icon: React.ReactNode;
  /** 是否選取 */
  selected?: boolean;
  /** 子標題（用於分組） */
  subheader?: string;
}

interface SideNavProps {
  /** 導航項目陣列 */
  items: NavItem[];
  /** 是否顯示分隔線 */
  showDividers?: boolean;
}

/**
 * 側邊導航元件
 * 從 NavItem 陣列自動產生側邊導航列表
 */
export const SideNav: React.FC<SideNavProps> = ({ items, showDividers = true }) => {
  return (
    <List>
      {items.map((item, index) => (
        <React.Fragment key={item.link || index}>
          {item.subheader && (
            <>
              {showDividers && index > 0 && <Divider />}
              <ListSubheader>{item.subheader}</ListSubheader>
            </>
          )}
          <MenuItem
            title={item.title}
            link={item.link}
            icon={item.icon}
            selected={item.selected}
          />
        </React.Fragment>
      ))}
    </List>
  );
};
