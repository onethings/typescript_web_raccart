/**
 * 使用者編輯/新增頁面
 *
 * 管理使用者資訊、偏好、限制、權限、屬性。
 * 對應 FRONTME.md 7.4 UserPage 章節。
 */

import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EditItemView } from '../../components/common/EditItemView';
import { PasswordField } from '../../components/common/PasswordField';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { useTranslation } from '../../i18n/LocalizationProvider';
import type { User } from '../../types/models';

const defaultUser: User = {
  id: 0,
  name: '',
  email: '',
  readonly: false,
  administrator: false,
  disabled: false,
  deviceReadonly: false,
  limitCommands: false,
  fixedEmail: false,
};

/** 使用者編輯頁面 */
export const UserPage: React.FC = () => {
  const t = useTranslation();
  const [user, setUser] = useState<User | null>(null);

  const update = <K extends keyof User>(key: K, value: User[K]) => {
    if (user) setUser({ ...user, [key]: value });
  };

  return (
    <EditItemView<User>
      endpoint="users"
      item={user}
      setItem={setUser}
      defaultItem={defaultUser}
      validate={() => !!user?.name && !!user?.email}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsUser', user?.id ? 'Edit' : 'New']}
    >
      {user && (
        <>
          {/* 必要資訊 */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Required</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
                <TextField size="small" label={t('sharedName')} value={user.name} onChange={(e) => update('name', e.target.value)} required />
                <TextField size="small" label="Email" type="email" value={user.email} onChange={(e) => update('email', e.target.value)} required />
                <PasswordField size="small" label={t('userPassword')} value={user.password || ''} onChange={(e) => update('password', e.target.value)} />
              </div>
            </AccordionDetails>
          </Accordion>

          {/* 偏好設定 */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Preferences</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
                <TextField size="small" label={t('sharedPhone')} value={user.phone || ''} onChange={(e) => update('phone', e.target.value)} />
                <FormControl size="small">
                  <InputLabel>Coordinate Format</InputLabel>
                  <Select value={user.coordinateFormat || 'dd'} label="Coordinate Format" onChange={(e) => update('coordinateFormat', e.target.value)}>
                    <MenuItem value="dd">DD</MenuItem>
                    <MenuItem value="ddm">DDM</MenuItem>
                    <MenuItem value="dms">DMS</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </AccordionDetails>
          </Accordion>

          {/* 限制 */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Restrictions</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
                <FormControlLabel control={<Switch checked={!!user.readonly} onChange={(e) => update('readonly', e.target.checked)} />} label="Readonly" />
                <FormControlLabel control={<Switch checked={!!user.deviceReadonly} onChange={(e) => update('deviceReadonly', e.target.checked)} />} label="Device Readonly" />
                <FormControlLabel control={<Switch checked={!!user.disabled} onChange={(e) => update('disabled', e.target.checked)} />} label="Disabled" />
                <TextField size="small" label="Device Limit" type="number" value={user.deviceLimit || 0} onChange={(e) => update('deviceLimit', parseInt(e.target.value) || 0)} />
                <TextField size="small" label="User Limit" type="number" value={user.userLimit || 0} onChange={(e) => update('userLimit', parseInt(e.target.value) || 0)} />
              </div>
            </AccordionDetails>
          </Accordion>

          {/* 權限 */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Permissions</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
                <FormControlLabel control={<Switch checked={!!user.administrator} onChange={(e) => update('administrator', e.target.checked)} />} label="Administrator" />
                <FormControlLabel control={<Switch checked={!!user.limitCommands} onChange={(e) => update('limitCommands', e.target.checked)} />} label="Limit Commands" />
                <FormControlLabel control={<Switch checked={!!user.fixedEmail} onChange={(e) => update('fixedEmail', e.target.checked)} />} label="Fixed Email" />
              </div>
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </EditItemView>
  );
};
