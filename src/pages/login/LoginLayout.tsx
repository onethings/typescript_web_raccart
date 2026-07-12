/**
 * 登入頁面佈局
 * 
 * 左右分欄：左側 Logo（桌機）/ 右側表單
 * 對應 FRONTME.md 3.5 LoginLayout 章節。
 */

import React from 'react';
import { Paper, useMediaQuery, useTheme, Box } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { LogoImage } from '../../login/LogoImage';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    height: '100%',
  },
  sidebar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: theme.palette.primary.main,
    paddingBottom: theme.spacing(5),
    width: '28%',
    [theme.breakpoints.down('lg')]: {
      width: '52px',
    },
    [theme.breakpoints.down('sm')]: {
      width: '0px',
    },
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    boxShadow: '-2px 0px 16px rgba(0, 0, 0, 0.25)',
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(0, 25, 0, 0),
    },
  },
  form: {
    maxWidth: theme.spacing(52),
    padding: theme.spacing(5),
    width: '100%',
  },
}));

/**
 * 登入頁面佈局元件
 * 左側顯示 Logo，右側為表單內容
 */
export const LoginLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  return (
    <main className={classes.root}>
      <div className={classes.sidebar}>
        {isLargeScreen && (
          <Box sx={{ filter: 'brightness(0) invert(1)' }}>
            <LogoImage height={48} />
          </Box>
        )}
      </div>
      <Paper className={classes.paper}>
        <form className={classes.form}>{children}</form>
      </Paper>
    </main>
  );
};
