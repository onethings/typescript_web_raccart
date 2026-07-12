/**
 * 計算屬性編輯/新增頁面
 *
 * 建立或編輯計算屬性，支援表達式測試。
 * 對應 FRONTME.md 7.10 ComputedAttributePage 章節。
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
  Button,
  Snackbar,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EditItemView } from '../../components/common/EditItemView';
import { SelectField } from '../../components/common/SelectField';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { useAppSelector } from '../../hooks/useAppStore';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { useCatch } from '../../hooks/useAsyncTask';
import type { Attribute } from '../../types/models';
import { testAttribute } from '../../api/endpoints';

const defaultAttribute: Attribute = {
  description: '',
  attribute: '',
  expression: '',
  type: 'string',
};

const ATTRIBUTE_TYPES = [
  { id: 'string', name: 'String' },
  { id: 'number', name: 'Number' },
  { id: 'boolean', name: 'Boolean' },
];

/** 計算屬性編輯頁面 */
export const ComputedAttributePage: React.FC = () => {
  const t = useTranslation();
  const [attr, setAttr] = useState<Attribute | null>(null);
  const [testDeviceId, setTestDeviceId] = useState<number | ''>('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const devices = useAppSelector((state) => state.devices.items);
  const deviceList = Object.values(devices).map((d) => ({ id: d.id, name: d.name }));

  const update = <K extends keyof Attribute>(key: K, value: Attribute[K]) => {
    if (attr) setAttr({ ...attr, [key]: value });
  };

  /** 測試計算屬性 */
  const handleTest = useCatch(async () => {
    if (!attr || !testDeviceId) return;
    const res = await testAttribute(attr, Number(testDeviceId));
    setTestResult(typeof res.data === 'string' ? res.data : JSON.stringify(res.data));
    setSnackbarOpen(true);
  });

  return (
    <EditItemView<Attribute>
      endpoint="attributes/computed"
      item={attr}
      setItem={setAttr}
      defaultItem={defaultAttribute}
      validate={() => !!attr?.description && !!attr?.attribute && !!attr?.expression}
      menu={<SettingsMenu />}
      breadcrumbs={['sharedComputedAttributes', attr?.id ? 'Edit' : 'New']}
    >
      {attr && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Required</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
                <TextField size="small" label="Description" value={attr.description} onChange={(e) => update('description', e.target.value)} required />
                <TextField size="small" label="Attribute" value={attr.attribute} onChange={(e) => update('attribute', e.target.value)} required helperText="e.g. speed, altitude, course" />
                <TextField size="small" label="Expression" value={attr.expression} onChange={(e) => update('expression', e.target.value)} required multiline rows={3} />
                <FormControl size="small">
                  <InputLabel>Type</InputLabel>
                  <Select value={attr.type} label="Type" onChange={(e) => update('type', e.target.value)}>
                    {ATTRIBUTE_TYPES.map((t) => (
                      <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Test</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
                <SelectField
                  label="Test Device"
                  data={deviceList}
                  value={testDeviceId || undefined}
                  onChange={(val) => setTestDeviceId(val as number || '')}
                />
                <Button variant="outlined" onClick={handleTest} disabled={!attr.expression || !testDeviceId}>
                  Test Expression
                </Button>
              </div>
            </AccordionDetails>
          </Accordion>
        </>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        message={testResult ? `Result: ${testResult}` : 'No result'}
        onClose={() => setSnackbarOpen(false)}
      />
    </EditItemView>
  );
};
