/**
 * 發送指令給裝置頁面
 *
 * 選取已儲存指令或輸入新指令類型，發送給指定裝置。
 * 對應 FRONTME.md 7.9 CommandDevicePage 章節。
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { makeStyles } from 'tss-react/mui';
import { useCatch } from '../../hooks/useAsyncTask';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { BaseCommandView } from '../../components/common/BaseCommandView';
import type { Command } from '../../types/models';
import { sendCommand } from '../../api/endpoints';

const useStyles = makeStyles()((theme) => ({
  container: { paddingTop: theme.spacing(3), paddingBottom: theme.spacing(3) },
  section: { display: 'flex', flexDirection: 'column', gap: theme.spacing(2), width: '100%' },
  buttons: { display: 'flex', justifyContent: 'space-between', marginTop: theme.spacing(3), gap: theme.spacing(2) },
}));

/**
 * 發送指令給裝置頁面
 */
export const CommandDevicePage: React.FC = () => {
  const { classes } = useStyles();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useTranslation();

  const [command, setCommand] = useState<Partial<Command>>({});
  const [savedId, setSavedId] = useState<number>(0);

  const handleSend = useCatch(async () => {
    const payload: Partial<Command> = savedId
      ? { id: savedId }
      : command;

    await sendCommand(payload);
    navigate(-1);
  });

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['deviceTitle', 'Send Command']}>
      <Container maxWidth="xs" className={classes.container}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Command</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className={classes.section}>
              <BaseCommandView
                deviceId={id ? Number(id) : undefined}
                item={command}
                setItem={setCommand}
                includeSaved
                savedId={savedId}
                setSavedId={setSavedId}
              />
            </div>
          </AccordionDetails>
        </Accordion>

        <div className={classes.buttons}>
          <Button variant="outlined" onClick={() => navigate(-1)}>{t('sharedCancel')}</Button>
          <Button variant="contained" color="primary" onClick={handleSend}>
            Send
          </Button>
        </div>
      </Container>
    </PageLayout>
  );
};
