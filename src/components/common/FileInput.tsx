/**
 * 檔案上傳輸入元件
 *
 * 支援選取檔案、清除、預覽。
 * 對應 FRONTME.md 12.6 FileInput 章節。
 */

import React, { useRef } from 'react';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

interface FileInputProps {
  /** 選取檔案回呼 */
  onChange: (file: File | null) => void;
  /** 目前選取的檔案 */
  value?: File | null;
  /** 接受的文件類型 */
  accept?: string;
  /** 按鈕標籤 */
  label?: string;
}

/**
 * 檔案上傳元件
 * 支援選取、清除、顯示檔名
 */
export const FileInput: React.FC<FileInputProps> = ({
  onChange,
  value,
  accept,
  label = 'Choose File',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
    // 重置 input 以允許再次選取相同檔案
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <input ref={inputRef} type="file" accept={accept} hidden onChange={handleChange} />
      <Button variant="outlined" size="small" onClick={handleClick}>
        {label}
      </Button>
      {value && (
        <>
          <Typography variant="body2" color="textSecondary" noWrap sx={{ maxWidth: 200 }}>
            {value.name}
          </Typography>
          <IconButton size="small" onClick={() => onChange(null)}>
            <ClearIcon fontSize="small" />
          </IconButton>
        </>
      )}
    </Stack>
  );
};
