/**
 * 日曆編輯/新增頁面
 * 支援 .ics 上傳或簡易建立。
 * 對應 FRONTME.md 7.12 CalendarPage 章節。
 */

import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EditItemView } from '../../components/common/EditItemView';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { useTranslation } from '../../i18n/LocalizationProvider';
import type { Calendar } from '../../types/models';

const defaultCalendar: Calendar = { id: 0, name: '' };

export const CalendarPage: React.FC = () => {
  const t = useTranslation();
  const [calendar, setCalendar] = useState<Calendar | null>(null);

  return (
    <EditItemView<Calendar>
      endpoint="calendars"
      item={calendar}
      setItem={setCalendar}
      defaultItem={defaultCalendar}
      validate={() => !!calendar?.name}
      menu={<SettingsMenu />}
      breadcrumbs={['sharedCalendars', calendar?.id ? 'Edit' : 'New']}
    >
      {calendar && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Required</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
              <TextField size="small" label={t('sharedName')} value={calendar.name} onChange={(e) => setCalendar({ ...calendar, name: e.target.value })} required />
              <TextField size="small" label="iCalendar Data (base64)" value={calendar.data || ''} onChange={(e) => setCalendar({ ...calendar, data: e.target.value })} multiline rows={4} />
            </div>
          </AccordionDetails>
        </Accordion>
      )}
    </EditItemView>
  );
};
