/**
 * Autocomplete 選擇器（單選/多選）
 *
 * 支援從 API 載入或靜態資料。
 * 對應 FRONTME.md 12.19 SelectField 章節。
 */

import React, { useState, useCallback } from 'react';
import { Autocomplete, TextField, Chip } from '@mui/material';

interface SelectOption {
  id: number | string;
  name: string;
}

interface SelectFieldProps {
  label: string;
  /** 資料列表或載入函式 */
  data?: SelectOption[];
  /** 選取值（單選傳 id，多選傳陣列） */
  value?: number | string | (number | string)[] | null;
  onChange?: (value: number | string | (number | string)[] | null) => void;
  /** 多選模式 */
  multiple?: boolean;
  /** 是否包含「全部」選項 */
  includeAll?: boolean;
  allLabel?: string;
}

/**
 * 選擇器元件
 * 支援單選/多選/全部選項
 */
export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  data = [],
  value,
  onChange,
  multiple = false,
  includeAll = false,
  allLabel = 'All',
}) => {
  const options = includeAll
    ? [{ id: 'all', name: allLabel }, ...data]
    : data;

  const getSelected = useCallback(() => {
    if (multiple && Array.isArray(value)) {
      return options.filter((opt) => value.includes(opt.id));
    }
    return options.find((opt) => opt.id === value) || null;
  }, [value, options, multiple]);

  return (
    <Autocomplete
      size="small"
      multiple={multiple}
      options={options}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      value={getSelected()}
      onChange={(_, newValue) => {
        if (multiple && Array.isArray(newValue)) {
          // 處理「全部」邏輯
          const hasAll = newValue.some((v) => v.id === 'all');
          if (hasAll) {
            onChange?.('all' as unknown as number);
          } else {
            onChange?.(newValue.map((v) => v.id));
          }
        } else if (!multiple && newValue && !Array.isArray(newValue)) {
          onChange?.(newValue.id);
        } else {
          onChange?.(null);
        }
      }}
      renderInput={(params) => <TextField {...params} label={label} />}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...chipProps } = getTagProps({ index });
          return <Chip key={key} label={option.name} size="small" {...chipProps} />;
        })
      }
    />
  );
};
