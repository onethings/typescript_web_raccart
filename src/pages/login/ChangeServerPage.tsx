/**
 * 更換伺服器頁面
 * 
 * 切換到不同的 Traccar 伺服器（原生 App 用）。
 * 對應 FRONTME.md 3.4 ChangeServerPage 章節。
 */

import React, { useState, useEffect } from 'react';
import {
  Button,
  Container,
  TextField,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import VpnLockIcon from '@mui/icons-material/VpnLock';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { makeStyles } from 'tss-react/mui';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../../i18n/LocalizationProvider';

const useStyles = makeStyles()((theme) => ({
  icon: {
    textAlign: 'center',
    fontSize: '6rem',
    color: theme.palette.text.secondary,
  },
  container: {
    textAlign: 'center',
    padding: theme.spacing(5, 3),
  },
  field: {
    margin: theme.spacing(3, 0),
  },
  buttons: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-evenly',
  },
  qrHint: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
  },
}));

/** 官方伺服器列表 */
const OFFICIAL_SERVERS = [
  window.location.origin,
  'https://demo.traccar.org',
  'https://demo2.traccar.org',
  'https://demo3.traccar.org',
  'https://demo4.traccar.org',
  'https://server.traccar.org',
  'http://localhost:8082',
  'http://localhost:3000',
];

/**
 * 更換伺服器頁面
 */
export const ChangeServerPage: React.FC = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const t = useTranslation();

  const [inputValue, setInputValue] = useState(window.location.origin);
  const [qrMode, setQrMode] = useState(searchParams.get('qr') === '1');

  // 若從 LoginPage QR 按鈕過來，自動提示
  useEffect(() => {
    if (searchParams.get('qr') === '1') {
      setQrMode(true);
    }
  }, [searchParams]);

  /** 驗證 URL */
  const validateUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  /** 提交更換伺服器 */
  const handleSubmit = () => {
    const normalized = new URL(inputValue).toString();
    // 透過 Native bridge 或直接跳轉
    const win = window as unknown as Record<string, unknown>;
    const webkit = win.webkit as { messageHandlers?: Record<string, { postMessage: (msg: string) => void }> } | undefined;
    const appInterface = win.appInterface as { postMessage?: (msg: string) => void } | undefined;

    if (appInterface?.postMessage) {
      appInterface.postMessage(`server|${normalized}`);
    } else if (webkit?.messageHandlers?.appInterface) {
      webkit.messageHandlers.appInterface.postMessage(`server|${normalized}`);
    } else {
      window.location.replace(normalized);
    }
  };

  return (
    <Container maxWidth="xs" className={classes.container}>
      <div className={classes.icon}>
        {qrMode ? <QrCodeScannerIcon fontSize="inherit" /> : <VpnLockIcon fontSize="inherit" />}
      </div>
      <Typography variant="h6" gutterBottom>
        {t('settingsServer')}
      </Typography>
      <TextField
        fullWidth
        className={classes.field}
        label="Server URL"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        error={!!inputValue && !validateUrl(inputValue)}
        helperText={inputValue && !validateUrl(inputValue) ? 'Invalid URL' : undefined}
        InputProps={{
          endAdornment: (
            <Tooltip title="Scan QR Code">
              <IconButton size="small" onClick={() => setQrMode(!qrMode)}>
                <QrCodeScannerIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ),
        }}
      />
      {qrMode && (
        <div className={classes.qrHint}>
          Scan a QR code containing a server URL (e.g., from another device&apos;s login page) to auto-fill the field.
        </div>
      )}
      <div className={classes.buttons}>
        <Button variant="outlined" onClick={() => navigate('/login')}>
          {t('sharedCancel')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!validateUrl(inputValue)}
        >
          Connect
        </Button>
      </div>
      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
        {OFFICIAL_SERVERS.join(' • ')}
      </Typography>
    </Container>
  );
};
