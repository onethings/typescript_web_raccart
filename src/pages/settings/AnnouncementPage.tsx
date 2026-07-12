/**
 * 公告發送頁面（管理員/管理者專用）
 *
 * 向選取的使用者發送通知公告。
 * 對應 FRONTME.md 7.17 AnnouncementPage 章節。
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Snackbar,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { makeStyles } from 'tss-react/mui';
import { useCatch } from '../../hooks/useAsyncTask';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { SelectField } from '../../components/common/SelectField';
import { sendNotification } from '../../api/endpoints';

const useStyles = makeStyles()((theme) => ({
  container: { paddingTop: theme.spacing(3), paddingBottom: theme.spacing(3) },
  section: { display: 'flex', flexDirection: 'column', gap: theme.spacing(2), width: '100%' },
  buttons: { display: 'flex', justifyContent: 'space-between', marginTop: theme.spacing(3), gap: theme.spacing(2) },
}));

const NOTIFICATOR_OPTIONS = [
  { id: 'web', name: 'Web' },
  { id: 'mail', name: 'Email' },
  { id: 'sms', name: 'SMS' },
];

/**
 * 公告發送頁面
 */
export const AnnouncementPage: React.FC = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const [userIds, setUserIds] = useState<(number | string)[]>([]);
  const [notificator, setNotificator] = useState('web');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSend = useCatch(async () => {
    const ids = userIds.filter((id): id is number => typeof id === 'number');
    await sendNotification(notificator, ids, subject || undefined, body || undefined);
    setSnackbarOpen(true);
  });

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['serverAnnouncement']}>
      <Container maxWidth="xs" className={classes.container}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Send Announcement</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className={classes.section}>
              <SelectField
                label="Notificator"
                data={NOTIFICATOR_OPTIONS}
                value={notificator}
                onChange={(val) => setNotificator(String(val))}
              />
              <TextField
                size="small"
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                fullWidth
              />
              <TextField
                size="small"
                label="Body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                multiline
                rows={4}
                fullWidth
              />
            </div>
          </AccordionDetails>
        </Accordion>

        <div className={classes.buttons}>
          <Button variant="outlined" onClick={() => navigate(-1)}>{t('sharedCancel')}</Button>
          <Button variant="contained" onClick={handleSend} disabled={!body}>
            Send
          </Button>
        </div>
      </Container>
      <Snackbar open={snackbarOpen} autoHideDuration={1500} message="Announcement sent" onClose={() => setSnackbarOpen(false)} />
    </PageLayout>
  );
};
