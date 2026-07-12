/**
 * 分享連結頁面
 *
 * 產生裝置/群組的公開分享連結。
 * 對應 FRONTME.md 7.16 SharePage 章節。
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Button,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  InputAdornment,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { makeStyles } from 'tss-react/mui';
import { useAppSelector } from '../../hooks/useAppStore';
import { useCatch, useAsyncTask } from '../../hooks/useAsyncTask';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { shareDevice, shareGroup } from '../../api/endpoints';

const useStyles = makeStyles()((theme) => ({
  container: { paddingTop: theme.spacing(3), paddingBottom: theme.spacing(3) },
  section: { display: 'flex', flexDirection: 'column', gap: theme.spacing(2), width: '100%' },
  buttons: { display: 'flex', justifyContent: 'space-between', marginTop: theme.spacing(3), gap: theme.spacing(2) },
}));

/**
 * 分享連結頁面
 */
export const SharePage: React.FC = () => {
  const { classes } = useStyles();
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const t = useTranslation();

  const devices = useAppSelector((state) => state.devices.items);
  const groups = useAppSelector((state) => state.groups.items);

  const itemName = type === 'device'
    ? devices[Number(id)]?.name || `Device #${id}`
    : groups[Number(id)]?.name || `Group #${id}`;

  const [expiration, setExpiration] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 16);
  });
  const [shareToken, setShareToken] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCatch(async () => {
    const expISO = new Date(expiration).toISOString();
    let token: string;

    if (type === 'device') {
      const res = await shareDevice(Number(id), expISO);
      token = res.data;
    } else {
      const res = await shareGroup(Number(id), expISO);
      token = res.data;
    }

    setShareToken(token);
  });

  const handleCopy = () => {
    if (shareToken) {
      navigator.clipboard.writeText(shareToken);
      setCopied(true);
    }
  };

  const shareLink = shareToken
    ? `${window.location.origin}/share?token=${shareToken}`
    : '';

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['Share', type || '']}>
      <Container maxWidth="xs" className={classes.container}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Share {type}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className={classes.section}>
              <TextField size="small" label="Name" value={itemName} slotProps={{ input: { readOnly: true } }} />
              <TextField
                size="small"
                type="datetime-local"
                label="Expiration"
                value={expiration}
                onChange={(e) => setExpiration(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <Button variant="contained" onClick={handleGenerate}>
                Generate Link
              </Button>
              {shareToken && (
                <TextField
                  size="small"
                  label="Share Link"
                  value={shareLink}
                  slotProps={{
                    input: {
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={handleCopy}>
                            <ContentCopyIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  fullWidth
                />
              )}
            </div>
          </AccordionDetails>
        </Accordion>

        <div className={classes.buttons}>
          <Button variant="outlined" onClick={() => navigate(-1)}>{t('sharedCancel')}</Button>
        </div>
      </Container>
      <Snackbar open={copied} autoHideDuration={1500} message="Copied to clipboard" onClose={() => setCopied(false)} />
    </PageLayout>
  );
};
