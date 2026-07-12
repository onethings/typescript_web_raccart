/**
 * 群組編輯/新增頁面
 * 對應 FRONTME.md 7.6 GroupPage 章節。
 */

import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EditItemView } from '../../components/common/EditItemView';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { useTranslation } from '../../i18n/LocalizationProvider';
import type { Group } from '../../types/models';

const defaultGroup: Group = { id: 0, name: '' };

export const GroupPage: React.FC = () => {
  const t = useTranslation();
  const [group, setGroup] = useState<Group | null>(null);

  return (
    <EditItemView<Group>
      endpoint="groups"
      item={group}
      setItem={setGroup}
      defaultItem={defaultGroup}
      validate={() => !!group?.name}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsGroups', group?.id ? 'Edit' : 'New']}
    >
      {group && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Required</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
              <TextField size="small" label={t('sharedName')} value={group.name} onChange={(e) => setGroup({ ...group, name: e.target.value })} required />
            </div>
          </AccordionDetails>
        </Accordion>
      )}
    </EditItemView>
  );
};
