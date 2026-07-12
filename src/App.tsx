/**
 * 應用程式佈局元件
 * 
 * 使用 Outlet 渲染子路由。
 * 初始化時檢查 session，嵌入控制器。
 * 對應 FRONTME.md 2. App 佈局元件 章節。
 */

import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useMediaQuery, useTheme } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useAppDispatch, useAppSelector } from './hooks/useAppStore';
import { useAsyncTask, useCatch } from './hooks/useAsyncTask';
import { sessionActions } from './store';
import { SocketController } from './components/SocketController';
import { CachingController } from './components/CachingController';
import { MotionController } from './components/MotionController';
import { Loader } from './components/Loader';
import { BottomMenu } from './components/common/BottomMenu';
import { TermsDialog } from './components/common/TermsDialog';
import { UpdateController } from './UpdateController';
import { checkSession } from './api/endpoints';

const useStyles = makeStyles()(() => ({
  page: { flexGrow: 1, overflow: 'auto' },
  menu: {
    zIndex: 4,
    '@media print': { display: 'none' },
  },
}));

/**
 * 應用程式根佈局
 * 檢查登入狀態並嵌入全域控制器
 */
const App: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const user = useAppSelector((state) => state.session.user);
  const newServer = useAppSelector((state) => state.session.server?.newServer);
  const termsUrl = useAppSelector((state) => state.session.server?.attributes?.termsUrl as string | undefined);
  const termsAccepted = useAppSelector(
    (state) => (state.session.user?.attributes as Record<string, unknown> | undefined)?.termsAccepted,
  );

  // 檢查 session
  useAsyncTask(
    async ({ signal }) => {
      if (!user) {
        try {
          const response = await checkSession(signal);
          if (response.status === 200) {
            dispatch(sessionActions.updateUser(response.data));
          } else {
            window.sessionStorage.setItem(
              'postLogin',
              window.location.pathname + window.location.search,
            );
            navigate(newServer ? '/register' : '/login', { replace: true });
          }
        } catch {
          window.sessionStorage.setItem(
            'postLogin',
            window.location.pathname + window.location.search,
          );
          navigate(newServer ? '/register' : '/login', { replace: true });
        }
      }
      return null;
    },
    [user, dispatch, navigate, newServer],
  );

  /** 接受服務條款 */
  const acceptTerms = useCatch(async () => {
    if (!user) return;
    const response = await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...user,
        attributes: { ...user.attributes, termsAccepted: true },
      }),
    });
    dispatch(sessionActions.updateUser(await response.json()));
  });

  if (user == null) {
    return <Loader />;
  }

  if (termsUrl && !termsAccepted) {
    return (
      <TermsDialog
        open
        onCancel={() => navigate('/login')}
        onAccept={() => acceptTerms()}
      />
    );
  }

  return (
    <>
      <SocketController />
      <CachingController />
      <MotionController />
      <UpdateController />
      <div className={classes.page}>
        <Outlet />
      </div>
      {!desktop && (
        <div className={classes.menu}>
          <BottomMenu />
        </div>
      )}
    </>
  );
};

export default App;
