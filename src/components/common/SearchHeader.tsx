/**
 * 搜尋標題元件（含 debounce）
 *
 * 提供 500ms debounce 的搜尋輸入。
 * 對應 FRONTME.md 7.19 SearchHeader 章節。
 */

import React, { useState, useEffect, useRef } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from '../../i18n/LocalizationProvider';

interface SearchHeaderProps {
  /** 搜尋回呼（debounced） */
  onSearch: (keyword: string) => void;
  /** 預設值 */
  defaultValue?: string;
  /** 佔位文字 */
  placeholder?: string;
}

/**
 * Debounce 搜尋輸入元件
 * 500ms 延遲後觸發 onSearch
 */
export const SearchHeader: React.FC<SearchHeaderProps> = ({
  onSearch,
  defaultValue = '',
  placeholder,
}) => {
  const t = useTranslation();
  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(value);
    }, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, onSearch]);

  return (
    <TextField
      fullWidth
      size="small"
      placeholder={placeholder || 'Search...'}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};
