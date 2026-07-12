/**
 * 駕駛編輯/新增頁面
 * 對應 FRONTME.md 7.13 DriverPage 章節。
 */

import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EditItemView } from '../../components/common/EditItemView';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { useTranslation } from '../../i18n/LocalizationProvider';
import type { Driver } from '../../types/models';

const defaultDriver: Driver = { id: 0, name: '', uniqueId: '' };

export const DriverPage: React.FC = () => {
  const t = useTranslation();
  const [driver, setDriver] = useState<Driver | null>(null);

  return (
    <EditItemView<Driver>
      endpoint="drivers"
      item={driver}
      setItem={setDriver}
      defaultItem={defaultDriver}
      validate={() => !!driver?.name && !!driver?.uniqueId}
      menu={<SettingsMenu />}
      breadcrumbs={['sharedDrivers', driver?.id ? 'Edit' : 'New']}
    >
      {driver && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Required</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
              <TextField size="small" label={t('sharedName')} value={driver.name} onChange={(e) => setDriver({ ...driver, name: e.target.value })} required />
              <TextField size="small" label="Unique ID" value={driver.uniqueId} onChange={(e) => setDriver({ ...driver, uniqueId: e.target.value })} required />
            </div>
          </AccordionDetails>
        </Accordion>
      )}
    </EditItemView>
  );
};
