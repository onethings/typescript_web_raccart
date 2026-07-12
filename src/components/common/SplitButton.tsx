/**
 * 按鈕群組（主要動作 + 下拉選項）
 * 對應 FRONTME.md 12.21 SplitButton 章節。
 */

import React, { useState, useRef } from 'react';
import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface SplitButtonProps {
  /** 按鈕選項 { key: label } */
  options: Record<string, string>;
  /** 點擊回呼（接收選取的 key） */
  onClick: (key: string) => void;
  /** 是否停用 */
  disabled?: boolean;
}

/**
 * 分割按鈕元件
 * 主要動作 + 下拉選單
 */
export const SplitButton: React.FC<SplitButtonProps> = ({ options, onClick, disabled }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [selectedKey, setSelectedKey] = useState(Object.keys(options)[0]);

  const handleMenuItemClick = (key: string) => {
    setSelectedKey(key);
    setOpen(false);
    onClick(key);
  };

  return (
    <>
      <ButtonGroup variant="contained" ref={anchorRef} disabled={disabled}>
        <Button onClick={() => onClick(selectedKey)}>
          {options[selectedKey]}
        </Button>
        <Button
          size="small"
          onClick={() => setOpen(!open)}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper open={open} anchorEl={anchorRef.current} transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
            <Paper>
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <MenuList>
                  {Object.entries(options).map(([key, label]) => (
                    <MenuItem key={key} onClick={() => handleMenuItemClick(key)}>
                      {label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};
