/**
 * 通用指令類型選擇與屬性編輯元件
 *
 * 支援選取已儲存指令或輸入新指令類型，動態產生對應屬性欄位。
 * 對應 FRONTME.md 7.9 BaseCommandView 章節與 useCommandAttributes 章節。
 */

import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Checkbox,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useAppSelector } from '../../hooks/useAppStore';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { useAsyncTask } from '../../hooks/useAsyncTask';
import type { Command, CommandType } from '../../types/models';
import type { CommandOption, CommandAttributeDef } from '../../types/ui';
import { getDeviceCommands, getCommandTypes } from '../../api/endpoints';
import { prefixString } from '../../utils/stringUtils';

/** 指令類型對應的屬性定義 */
const COMMAND_ATTRIBUTES: Record<string, CommandAttributeDef[]> = {
  custom: [
    { key: 'data', name: 'Data', type: 'string' },
  ],
  positionPeriodic: [
    { key: 'frequency', name: 'Frequency (seconds)', type: 'number' },
  ],
  setTimezone: [
    { key: 'timezone', name: 'Timezone', type: 'string' },
  ],
  sendSms: [
    { key: 'message', name: 'Message', type: 'string' },
  ],
  message: [
    { key: 'message', name: 'Message', type: 'string' },
  ],
  outputControl: [
    { key: 'index', name: 'Output Index', type: 'number' },
    { key: 'data', name: 'Data', type: 'string' },
  ],
  setOdometer: [
    { key: 'data', name: 'Odometer (km)', type: 'number' },
  ],
  engineStop: [],
  engineResume: [],
  arm: [],
  disarm: [],
  alarmGeofence: [],
  alarmBattery: [],
  alarmSos: [],
  alarmRemove: [],
  doorLock: [],
  doorUnlock: [],
  relayOn: [],
  relayOff: [],
  videoStart: [
    { key: 'channel', name: 'Channel', type: 'number' },
  ],
  videoStop: [
    { key: 'channel', name: 'Channel', type: 'number' },
  ],
};

interface BaseCommandViewProps {
  /** 裝置 ID（用於載入可用的已儲存指令） */
  deviceId?: number;
  /** 目前指令物件 */
  item: Partial<Command>;
  /** 設定指令 */
  setItem: (item: Partial<Command>) => void;
  /** 是否包含已儲存指令選項 */
  includeSaved?: boolean;
  /** 已選取的已儲存指令 ID */
  savedId?: number;
  /** 設定已儲存指令 ID */
  setSavedId?: (id: number) => void;
}

/**
 * 通用指令檢視元件
 * 提供指令類型選擇與動態屬性編輯
 */
export const BaseCommandView: React.FC<BaseCommandViewProps> = ({
  deviceId,
  item,
  setItem,
  includeSaved = false,
  savedId,
  setSavedId,
}) => {
  const t = useTranslation();
  const [options, setOptions] = useState<CommandOption[]>([]);
  const [attributes, setAttributes] = useState<CommandAttributeDef[]>([]);

  // 載入指令選項
  useAsyncTask(
    async ({ signal }) => {
      let combined: CommandOption[] = [];

      if (includeSaved && deviceId) {
        const savedRes = await getDeviceCommands(deviceId);
        const saved = savedRes.data.map((cmd) => ({
          ...cmd,
          optionType: 'saved' as const,
          key: `saved-${cmd.id}`,
        }));
        combined = saved;

        const typesRes = await getCommandTypes(deviceId);
        const types = typesRes.data.map((t) => ({
          ...t,
          optionType: 'type' as const,
          key: `type-${t.type}`,
        }));
        combined = [...combined, ...types];
      } else {
        const typesRes = await getCommandTypes(deviceId);
        const types = typesRes.data.map((t) => ({
          ...t,
          optionType: 'type' as const,
          key: `type-${t.type}`,
        }));
        combined = types;
      }

      setOptions(combined);
    },
    [deviceId, includeSaved],
  );

  // 根據選取的指令類型更新屬性欄位
  useEffect(() => {
    if (item?.type) {
      setAttributes(COMMAND_ATTRIBUTES[item.type] || []);
    } else {
      setAttributes([]);
    }
  }, [item?.type]);

  /** 處理選擇 */
  const handleSelect = (_: unknown, value: CommandOption | null) => {
    if (!value) return;

    if (value.optionType === 'saved' && value.id != null) {
      setSavedId?.(value.id);
      setItem({});
    } else if (value.type) {
      setSavedId?.(0);
      const defaults: Record<string, unknown> = {};
      (COMMAND_ATTRIBUTES[value.type] || []).forEach((attr) => {
        defaults[attr.key] = attr.type === 'boolean' ? false : attr.type === 'number' ? 0 : '';
      });
      setItem({ ...item, type: value.type, attributes: defaults });
    }
  };

  return (
    <>
      <Autocomplete
        size="small"
        options={options}
        groupBy={(option) =>
          includeSaved
            ? option.optionType === 'saved' ? t('sharedSavedCommands') : t('sharedType')
            : undefined
        }
        getOptionLabel={(option) =>
          option.optionType === 'saved'
            ? option.description || ''
            : t(prefixString('command', option.type || ''))
        }
        isOptionEqualToValue={(option, value) => option.key === value.key}
        value={
          savedId
            ? options.find((o) => o.optionType === 'saved' && o.id === savedId) || null
            : options.find((o) => o.optionType === 'type' && o.type === item?.type) || null
        }
        onChange={handleSelect}
        renderInput={(params) => <TextField {...params} label={t('sharedType')} />}
      />

      {(!includeSaved || !savedId) &&
        attributes.map(({ key, name, type: attrType }) => {
          if (attrType === 'boolean') {
            return (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    checked={!!(item.attributes as Record<string, unknown>)?.[key]}
                    onChange={(e) => {
                      setItem({
                        ...item,
                        attributes: { ...item.attributes as Record<string, unknown>, [key]: e.target.checked },
                      });
                    }}
                  />
                }
                label={name}
              />
            );
          }
          return (
            <TextField
              key={key}
              size="small"
              type={attrType === 'number' ? 'number' : 'text'}
              label={name}
              value={(item.attributes as Record<string, unknown>)?.[key] ?? ''}
              onChange={(e) => {
                setItem({
                  ...item,
                  attributes: {
                    ...item.attributes as Record<string, unknown>,
                    [key]: attrType === 'number' ? Number(e.target.value) : e.target.value,
                  },
                });
              }}
              fullWidth
            />
          );
        })}

      {includeSaved && savedId !== undefined && (
        <FormControlLabel
          control={
            <Switch
              checked={!!item.textChannel}
              onChange={(e) => setItem({ ...item, textChannel: e.target.checked })}
            />
          }
          label="Send as SMS"
        />
      )}
    </>
  );
};
