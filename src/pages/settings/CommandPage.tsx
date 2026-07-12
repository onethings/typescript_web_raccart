/**
 * 已儲存指令編輯/新增頁面
 *
 * 建立或編輯已儲存的指令，使用 BaseCommandView。
 * 對應 FRONTME.md 7.9 CommandPage 章節。
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EditItemView } from '../../components/common/EditItemView';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { useTranslation } from '../../i18n/LocalizationProvider';
import type { Command } from '../../types/models';

const defaultCommand: Command = {
  type: 'custom',
  description: '',
  textChannel: false,
  attributes: {},
};

/** 已儲存指令編輯頁面 */
export const CommandPage: React.FC = () => {
  const t = useTranslation();
  const [command, setCommand] = useState<Command | null>(null);

  const update = <K extends keyof Command>(key: K, value: Command[K]) => {
    if (command) setCommand({ ...command, [key]: value });
  };

  return (
    <EditItemView<Command>
      endpoint="commands"
      item={command}
      setItem={setCommand}
      defaultItem={defaultCommand}
      validate={() => !!command?.type}
      menu={<SettingsMenu />}
      breadcrumbs={['sharedSavedCommands', command?.id ? 'Edit' : 'New']}
    >
      {command && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{t('sharedType')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
                <TextField
                  size="small"
                  label={t('sharedType')}
                  value={command.type}
                  onChange={(e) => update('type', e.target.value)}
                  required
                />
                <TextField
                  size="small"
                  label="Description"
                  value={command.description || ''}
                  onChange={(e) => update('description', e.target.value)}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!command.textChannel}
                      onChange={(e) => update('textChannel', e.target.checked)}
                    />
                  }
                  label="Send as SMS"
                />
              </div>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Attributes</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
                {(command.attributes && Object.keys(command.attributes).length > 0
                  ? Object.entries(command.attributes)
                  : []
                ).map(([key, value]) => (
                  <TextField
                    key={key}
                    size="small"
                    label={key}
                    value={String(value)}
                    onChange={(e) => {
                      update('attributes', {
                        ...command.attributes,
                        [key]: e.target.value,
                      });
                    }}
                  />
                ))}
                {(!command.attributes || Object.keys(command.attributes).length === 0) && (
                  <Typography variant="caption" color="textSecondary">
                    No attributes. Save the command type first to add parameters.
                  </Typography>
                )}
              </div>
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </EditItemView>
  );
};
