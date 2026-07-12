/**
 * 關聯選擇器元件
 *
 * 使用 Autocomplete 搜尋並建立/移除物件間的權限關聯。
 * 對應 FRONTME.md 12.8 LinkField 章節。
 */

import React, { useState, useCallback, useRef } from 'react';
import { Autocomplete, TextField, Chip } from '@mui/material';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { useAsyncTask } from '../../hooks/useAsyncTask';
import { createPermission, deletePermission } from '../../api/endpoints';
import type { Permission } from '../../types/models';

interface LinkOption {
  id: number;
  name: string;
}

interface LinkFieldProps {
  /** 標籤 */
  label: string;
  /** 取得所有項目的 API 端點 */
  endpointAll: string;
  /** 取得已關聯項目的 API 端點 */
  endpointLinked: string;
  /** 基礎物件 ID (如 deviceId, groupId) */
  baseId: number;
  /** 基礎物件的 key 名稱 */
  keyBase: string;
  /** 關聯物件的 key 名稱 */
  keyLink: string;
}

/**
 * 關聯欄位元件
 * 用於管理兩個實體間的權限連結
 */
export const LinkField: React.FC<LinkFieldProps> = ({
  label,
  endpointAll,
  endpointLinked,
  baseId,
  keyBase,
  keyLink,
}) => {
  const t = useTranslation();
  const [allOptions, setAllOptions] = useState<LinkOption[]>([]);
  const [linked, setLinked] = useState<LinkOption[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [inputValue, setInputValue] = useState('');

  /** 載入資料（首次 focus 時） */
  const handleFocus = useCallback(async () => {
    if (loaded) return;
    setLoaded(true);

    try {
      const [allRes, linkedRes] = await Promise.all([
        fetch(endpointAll).then((r) => r.json()),
        fetch(endpointLinked).then((r) => r.json()),
      ]);
      setAllOptions(allRes.map((item: { id: number; name: string }) => ({ id: item.id, name: item.name })));
      setLinked(linkedRes.map((item: { id: number; name: string }) => ({ id: item.id, name: item.name })));
    } catch {
      // ignore
    }
  }, [loaded, endpointAll, endpointLinked]);

  /** 建立關聯 */
  const handleLink = async (option: LinkOption) => {
    const permission: Permission = { [keyBase]: baseId, [keyLink]: option.id };
    try {
      await createPermission(permission);
      setLinked([...linked, option]);
    } catch { /* ignore */ }
  };

  /** 移除關聯 */
  const handleUnlink = async (option: LinkOption) => {
    const permission: Permission = { [keyBase]: baseId, [keyLink]: option.id };
    try {
      await deletePermission(permission);
      setLinked(linked.filter((l) => l.id !== option.id));
    } catch { /* ignore */ }
  };

  const available = allOptions.filter(
    (opt) => !linked.some((l) => l.id === opt.id),
  );

  return (
    <Autocomplete
      size="small"
      multiple
      options={available}
      value={linked}
      getOptionLabel={(option) => option.name}
      inputValue={inputValue}
      onInputChange={(_, v) => setInputValue(v)}
      onFocus={handleFocus}
      onChange={(_, newValue, reason) => {
        if (reason === 'removeOption') {
          // 找出被移除的選項
          const removed = linked.find((l) => !newValue.some((n) => n.id === l.id));
          if (removed) handleUnlink(removed);
        }
      }}
      renderInput={(params) => <TextField {...params} label={label} />}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...chipProps } = getTagProps({ index });
          return (
            <Chip
              key={key}
              label={option.name}
              size="small"
              onDelete={() => handleUnlink(option)}
              {...chipProps}
            />
          );
        })
      }
    />
  );
};
