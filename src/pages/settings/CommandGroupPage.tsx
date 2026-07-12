/**
 * 發送指令給群組頁面
 *
 * 對一個群組內的所有裝置發送自訂指令。
 * 對應 FRONTME.md 7.9 CommandGroupPage 章節。
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { makeStyles } from 'tss-react/mui';
import { useAppSelector } from '../../hooks/useAppStore';
import { useCatch } from '../../hooks/useAsyncTask';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { sendCommand } from '../../api/endpoints';
import type { Command } from '../../types/models';

const useStyles = makeStyles()((theme) => ({
  container: { paddingTop: theme.spacing(3), paddingBottom: theme.spacing(3) },
  section: { display: 'flex', flexDirection: 'column', gap: theme.spacing(2), width: '100%' },
  buttons: { display: 'flex', justifyContent: 'space-between', marginTop: theme.spacing(3), gap: theme.spacing(2) },
}));

/** 發送指令給群組頁面 */
export const CommandGroupPage: React.FC = () => {
  const { classes } = useStyles();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useTranslation();

  const group = useAppSelector((state) => (id ? state.groups.items[Number(id)] : undefined));

  const [type, setType] = useState('custom');
  const [data, setData] = useState('');
  const [textChannel, setTextChannel] = useState(false);

  const handleSend = useCatch(async () => {
    const command: Partial<Command> = {
      type,
      textChannel,
      attributes: data ? { data } : undefined,
    };
    await sendCommand(command, id ? Number(id) : undefined);
    navigate(-1);
  });

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsGroups', group?.name || `#${id}`, 'Send Command']}>
      <Container maxWidth="xs" className={classes.container}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Send Command to {group?.name || `Group #${id}`}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className={classes.section}>
              <TextField
                size="small"
                label={t('sharedType')}
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              />
              <TextField
                size="small"
                label="Data"
                value={data}
                onChange={(e) => setData(e.target.value)}
                multiline
                rows={3}
              />
              <FormControlLabel
                control={<Switch checked={textChannel} onChange={(e) => setTextChannel(e.target.checked)} />}
                label="Send as SMS"
              />
            </div>
          </AccordionDetails>
        </Accordion>

        <div className={classes.buttons}>
          <Button variant="outlined" onClick={() => navigate(-1)}>{t('sharedCancel')}</Button>
          <Button variant="contained" color="primary" onClick={handleSend} disabled={!type}>
            Send to Group
          </Button>
        </div>
      </Container>
    </PageLayout>
  );
};
