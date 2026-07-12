/**
 * 圍欄編輯/新增頁面
 * 對應 FRONTME.md 7.7 GeofencePage 章節。
 */

import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Switch, FormControlLabel } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EditItemView } from '../../components/common/EditItemView';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { useTranslation } from '../../i18n/LocalizationProvider';
import type { Geofence } from '../../types/models';

const defaultGeofence: Geofence = { id: 0, name: '' };

export const GeofencePage: React.FC = () => {
  const t = useTranslation();
  const [geofence, setGeofence] = useState<Geofence | null>(null);

  const update = <K extends keyof Geofence>(key: K, value: Geofence[K]) => {
    if (geofence) setGeofence({ ...geofence, [key]: value });
  };

  return (
    <EditItemView<Geofence>
      endpoint="geofences"
      item={geofence}
      setItem={setGeofence}
      defaultItem={defaultGeofence}
      validate={() => !!geofence?.name}
      menu={<SettingsMenu />}
      breadcrumbs={['sharedGeofences', geofence?.id ? 'Edit' : 'New']}
    >
      {geofence && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Required</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
                <TextField size="small" label={t('sharedName')} value={geofence.name} onChange={(e) => update('name', e.target.value)} required />
              </div>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Extra</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
                <TextField size="small" label="Description" value={geofence.description || ''} onChange={(e) => update('description', e.target.value)} />
                <TextField size="small" label="Area (WKT)" value={geofence.area || ''} onChange={(e) => update('area', e.target.value)} multiline rows={3} />
                <FormControlLabel control={<Switch checked={(geofence.attributes as Record<string, unknown>)?.['hide'] as boolean || false} onChange={(e) => update('attributes', { ...geofence.attributes, hide: e.target.checked })} />} label="Hide on Map" />
              </div>
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </EditItemView>
  );
};
