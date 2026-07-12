/**
 * 密碼輸入元件（含顯示/隱藏切換）
 * 對應 FRONTME.md 12.15 PasswordField 章節。
 */

import React, { useState } from 'react';
import { TextField, IconButton, InputAdornment, TextFieldProps } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

/**
 * 密碼輸入欄位
 * 提供顯示/隱藏密碼的切換按鈕
 */
export const PasswordField: React.FC<TextFieldProps> = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      {...props}
      type={showPassword ? 'text' : 'password'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};
