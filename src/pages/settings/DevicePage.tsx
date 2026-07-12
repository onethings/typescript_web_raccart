/**
 * 裝置編輯/新增頁面
 *
 * 管理裝置的 name, uniqueId, group, phone, model, category, 圖片, 屬性。
 * 對應 FRONTME.md 7.5 DevicePage 章節。
 */

import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EditItemView } from '../../components/common/EditItemView';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { DEVICE_CATEGORIES } from '../../utils/deviceCategories';
import type { Device } from '../../types/models';

const defaultDevice: Device = {
  id: 0,
  name: '',
  uniqueId: '',
  status: 'unknown',
};

/** 裝置編輯頁面 */
export const DevicePage: React.FC = () => {
  const t = useTranslation();
  const [device, setDevice] = useState<Device | null>(null);

  const update = <K extends keyof Device>(key: K, value: Device[K]) => {
    if (device) setDevice({ ...device, [key]: value });
  };

  return (
    <EditItemView<Device>
      endpoint="devices"
      item={device}
      setItem={setDevice}
      defaultItem={defaultDevice}
      validate={() => !!device?.name && !!device?.uniqueId}
      menu={<SettingsMenu />}
      breadcrumbs={['deviceTitle', device?.id ? 'Edit' : 'New']}
    >
      {device && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Required</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
                <TextField size="small" label={t('sharedName')} value={device.name} onChange={(e) => update('name', e.target.value)} required />
                <TextField size="small" label="Unique ID" value={device.uniqueId} onChange={(e) => update('uniqueId', e.target.value)} required />
              </div>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Extra</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
                <TextField size="small" label={t('sharedPhone')} value={device.phone || ''} onChange={(e) => update('phone', e.target.value)} />
                <TextField size="small" label="Model" value={device.model || ''} onChange={(e) => update('model', e.target.value)} />
                <TextField size="small" label="Contact" value={device.contact || ''} onChange={(e) => update('contact', e.target.value)} />
                <FormControl size="small">
                  <InputLabel>Category</InputLabel>
                  <Select value={device.category || 'default'} label="Category" onChange={(e) => update('category', e.target.value)}>
                    {DEVICE_CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </EditItemView>
  );
};
