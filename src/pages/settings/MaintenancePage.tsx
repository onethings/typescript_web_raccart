/**
 * 保養規則編輯/新增頁面
 * 對應 FRONTME.md 7.11 MaintenancePage 章節。
 */

import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EditItemView } from '../../components/common/EditItemView';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { useTranslation } from '../../i18n/LocalizationProvider';
import type { Maintenance } from '../../types/models';

const defaultMaint: Maintenance = { id: 0, name: '', type: 'distance' };

export const MaintenancePage: React.FC = () => {
  const t = useTranslation();
  const [maint, setMaint] = useState<Maintenance | null>(null);

  return (
    <EditItemView<Maintenance>
      endpoint="maintenance"
      item={maint}
      setItem={setMaint}
      defaultItem={defaultMaint}
      validate={() => !!maint?.name && !!maint?.type}
      menu={<SettingsMenu />}
      breadcrumbs={['sharedMaintenance', maint?.id ? 'Edit' : 'New']}
    >
      {maint && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Required</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
              <TextField size="small" label={t('sharedName')} value={maint.name} onChange={(e) => setMaint({ ...maint, name: e.target.value })} required />
              <TextField size="small" label="Type" value={maint.type} onChange={(e) => setMaint({ ...maint, type: e.target.value })} required helperText="e.g. distance, engineHours, speed" />
              <TextField size="small" label="Start" type="number" value={maint.start ?? 0} onChange={(e) => setMaint({ ...maint, start: parseFloat(e.target.value) || 0 })} />
              <TextField size="small" label="Period" type="number" value={maint.period ?? 0} onChange={(e) => setMaint({ ...maint, period: parseFloat(e.target.value) || 0 })} />
            </div>
          </AccordionDetails>
        </Accordion>
      )}
    </EditItemView>
  );
};
