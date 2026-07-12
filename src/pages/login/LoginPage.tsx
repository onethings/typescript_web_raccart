/**
 * 登入頁面
 * 
 * 支援密碼登入、Token 登入、OpenID 登入、TOTP 二階段驗證。
 * 對應 FRONTME.md 3.1 LoginPage 章節。
 */

import React, { useState, useCallback } from 'react';
import {
  Button,
  TextField,
  Link,
  Snackbar,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import VpnLockIcon from '@mui/icons-material/VpnLock';
import { makeStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { sessionActions } from '../../store';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { LoginLayout } from './LoginLayout';
import { login, checkSession, openidAuth } from '../../api/endpoints';
import { setUnauthorizedHandler } from '../../api/client';

const useStyles = makeStyles()((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  extraContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing(4),
    marginTop: theme.spacing(2),
  },
  link: {
    cursor: 'pointer',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

/**
 * 登入頁面
 * 提供 email + 密碼登入，支援 TOTP 驗證
 */
export const LoginPage: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const [email, setEmail] = useState(() => window.localStorage.getItem('loginEmail') || '');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [failed, setFailed] = useState(false);
  const [codeEnabled, setCodeEnabled] = useState(false);

  const registrationEnabled = useAppSelector((state) => state.session.server?.registration);

  // 註冊 401 處理（導向登入頁）
  React.useEffect(() => {
    setUnauthorizedHandler(() => {
      dispatch(sessionActions.updateUser(null));
      navigate('/login');
    });
  }, [dispatch, navigate]);

  /** 處理密碼登入 */
  const handlePasswordLogin = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setFailed(false);

      try {
        // 記憶 Email
        window.localStorage.setItem('loginEmail', email);

        const response = await login(email, password, code || undefined);

        if (response.status === 200) {
          dispatch(sessionActions.updateUser(response.data));

          // 導向目標頁面
          const target = window.sessionStorage.getItem('postLogin') || '/';
          window.sessionStorage.removeItem('postLogin');
          navigate(target, { replace: true });
        }
      } catch (error: unknown) {
        const apiError = error as { status?: number; message?: string; response?: { headers?: Record<string, string>; status?: number } };
        
        // 檢查 TOTP 要求
        if (
          (apiError.status === 401 || (apiError as { response?: { status?: number } }).response?.status === 401) &&
          (apiError as { response?: { headers?: Record<string, string> } }).response?.headers?.['www-authenticate'] === 'TOTP'
        ) {
          setCodeEnabled(true);
        } else {
          setFailed(true);
          setPassword('');
        }
      }
    },
    [email, password, code, dispatch, navigate],
  );

  /** 處理 OpenID 登入 */
  const handleOpenIdLogin = useCallback(async () => {
    try {
      const res = await openidAuth();
      if (res.data?.url) {
        window.location.href = res.data.url as string;
      }
    } catch {
      setFailed(true);
    }
  }, []);

  const openidEnabled = useAppSelector((state) => (state.session.server?.attributes as Record<string, unknown>)?.openidEnabled as boolean | undefined);

  return (
    <LoginLayout>
      <div className={classes.container}>
        {/* 工具列：QR 掃碼登入、更換伺服器 */}
        <div className={classes.toolbar}>
          <Tooltip title="QR Code Login">
            <IconButton size="small" onClick={() => navigate('/change-server?qr=1')}>
              <QrCodeScannerIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Change Server">
            <IconButton size="small" onClick={() => navigate('/change-server')}>
              <VpnLockIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>

        <TextField
          required
          type="email"
          label={t('userEmail')}
          name="email"
          value={email}
          autoComplete="email"
          autoFocus
          error={failed}
          helperText={failed ? t('loginTitle') + ' ' + t('loginTitle') : undefined}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          required
          type="password"
          label={t('userPassword')}
          name="password"
          value={password}
          autoComplete="current-password"
          error={failed}
          onChange={(e) => setPassword(e.target.value)}
        />
        {codeEnabled && (
          <TextField
            required
            label={t('loginTotp')}
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        )}
        <Button
          variant="contained"
          color="secondary"
          onClick={handlePasswordLogin}
          type="submit"
          disabled={!email || !password}
          fullWidth
        >
          {t('loginTitle')}
        </Button>

        {/* OpenID 登入 */}
        {openidEnabled && (
          <Button
            variant="outlined"
            color="primary"
            onClick={handleOpenIdLogin}
            fullWidth
          >
            {t('loginOpenId') || 'Sign in with OpenID'}
          </Button>
        )}

        <div className={classes.extraContainer}>
          {registrationEnabled && (
            <Link
              className={classes.link}
              onClick={() => navigate('/register')}
              underline="hover"
            >
              {t('loginRegister')}
            </Link>
          )}
          <Link
            className={classes.link}
            onClick={() => navigate('/reset-password')}
            underline="hover"
          >
            {t('loginReset')}
          </Link>
          <Link
            className={classes.link}
            onClick={() => navigate('/change-server')}
            underline="hover"
          >
            {t('settingsServer')}
          </Link>
        </div>
      </div>
    </LoginLayout>
  );
};
