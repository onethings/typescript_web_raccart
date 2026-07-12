/**
 * 重設密碼頁面
 * 
 * 兩種模式：
 * 1. 無 token: 輸入 Email → 發送重設信
 * 2. 有 token: 輸入新密碼 → 更新密碼
 * 對應 FRONTME.md 3.3 ResetPasswordPage 章節。
 */

import React, { useState } from 'react';
import { Button, TextField, Typography, Snackbar, IconButton } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoginLayout } from './LoginLayout';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { useCatch } from '../../hooks/useAsyncTask';
import { resetPassword, updatePassword } from '../../api/endpoints';

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
 * 重設密碼頁面
 */
export const ResetPasswordPage: React.FC = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('passwordReset');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  /** 提交表單 */
  const handleSubmit = useCatch(async () => {
    if (!token) {
      await resetPassword(email);
    } else {
      await updatePassword(token, password);
    }
    setSnackbarOpen(true);
  });

  return (
    <LoginLayout>
      <div className={classes.container}>
        <div className={classes.header}>
          <IconButton color="primary" onClick={() => navigate('/login')}>
            <span>←</span>
          </IconButton>
          <Typography className={classes.title} color="primary">
            {t('loginReset')}
          </Typography>
        </div>
        {!token ? (
          <TextField
            required
            type="email"
            label={t('userEmail')}
            name="email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        ) : (
          <TextField
            required
            type="password"
            label={t('userPassword')}
            name="password"
            value={password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
        <Button
          variant="contained"
          color="secondary"
          type="submit"
          onClick={handleSubmit}
          disabled={!/^(.+)@(.+)\.(.{2,})$/.test(email) && !password}
          fullWidth
        >
          {t('loginReset')}
        </Button>
      </div>
      <Snackbar
        open={snackbarOpen}
        onClose={() => navigate('/login')}
        autoHideDuration={1500}
        message={!token ? t('loginResetSuccess') : t('loginUpdateSuccess')}
      />
    </LoginLayout>
  );
};
