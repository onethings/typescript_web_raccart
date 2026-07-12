/**
 * 註冊頁面
 * 
 * 新使用者註冊，支援 TOTP 強制啟用。
 * 對應 FRONTME.md 3.2 RegisterPage 章節。
 */

import React, { useState } from 'react';
import { Button, TextField, Typography, Snackbar, IconButton } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { LoginLayout } from './LoginLayout';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { useCatch, useAsyncTask } from '../../hooks/useAsyncTask';
import { sessionActions } from '../../store';
import { createUser, generateTotpKey } from '../../api/endpoints';

const useStyles = makeStyles()((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.spacing(3),
    fontWeight: 500,
    marginLeft: theme.spacing(1),
    textTransform: 'uppercase' as const,
  },
}));

/**
 * 註冊頁面
 * 提供名稱、Email、密碼表單
 */
export const RegisterPage: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const server = useAppSelector((state) => state.session.server);
  const totpForce = useAppSelector(
    (state) => state.session.server?.attributes?.totpForce as boolean | undefined,
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpKey, setTotpKey] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // 若 TOTP 強制啟用，預先產生金鑰
  useAsyncTask(
    async ({ signal }) => {
      if (totpForce) {
        const response = await generateTotpKey();
        if (response.status === 200) {
          setTotpKey(response.data);
        }
      }
    },
    [totpForce],
  );

  /** 提交註冊 */
  const handleSubmit = useCatch(async () => {
    await createUser({ name, email, password, attributes: totpKey ? { totpKey } : undefined });
    setSnackbarOpen(true);
  });

  /** Email 驗證 */
  const isValidEmail = /^(.+)@(.+)\.(.{2,})$/.test(email);

  return (
    <LoginLayout>
      <div className={classes.container}>
        <div className={classes.header}>
          <IconButton color="primary" onClick={() => navigate('/login')}>
            <span>←</span>
          </IconButton>
          <Typography className={classes.title} color="primary">
            {t('loginRegister')}
          </Typography>
        </div>
        <TextField
          required
          label={t('sharedName')}
          name="name"
          value={name}
          autoComplete="name"
          autoFocus
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          required
          type="email"
          label={t('userEmail')}
          name="email"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          required
          type="password"
          label={t('userPassword')}
          name="password"
          value={password}
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
        />
        {totpForce && totpKey && (
          <TextField
            required
            label={t('loginTotpKey')}
            name="totpKey"
            value={totpKey}
            slotProps={{
              input: { readOnly: true } as Record<string, unknown>,
            }}
          />
        )}
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSubmit}
          type="submit"
          disabled={!name || !password || !(server?.newServer || isValidEmail)}
          fullWidth
        >
          {t('loginRegister')}
        </Button>
      </div>
      <Snackbar
        open={snackbarOpen}
        onClose={() => {
          dispatch(sessionActions.updateServer({ ...server, newServer: false } as typeof server));
          navigate('/login');
        }}
        autoHideDuration={1500}
        message={t('loginCreated')}
      />
    </LoginLayout>
  );
};
