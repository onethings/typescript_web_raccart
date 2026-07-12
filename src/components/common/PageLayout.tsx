/**
 * 頁面佈局元件
 *
 * 響應式設定頁面佈局：
 * - 桌機: 永久 Drawer（可 mini-variant）+ 內容區
 * - 手機: 臨時 Drawer + AppBar + 內容區
 * 對應 FRONTME.md 12.14 PageLayout 章節。
 */

import React, { useState } from 'react';
import {
  AppBar,
  Breadcrumbs,
  Divider,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../../i18n/LocalizationProvider';

const useStyles = makeStyles<{ miniVariant: boolean }>()((theme, { miniVariant }) => ({
  root: {
    height: '100%',
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  },
  desktopDrawer: {
    width: miniVariant ? theme.spacing(7) : 360,
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    ...(miniVariant && {
      '& .MuiListItemButton-root': { minHeight: 48 },
      '& .MuiListItemText-root': { display: 'none' },
    }),
    '@media print': { display: 'none' },
  },
  mobileDrawer: {
    width: 320,
    '@media print': { display: 'none' },
  },
  mobileToolbar: {
    zIndex: 1,
    '@media print': { display: 'none' },
  },
  content: {
    flexGrow: 1,
    alignItems: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
}));

/** 頁面標題（含麵包屑） */
const PageTitle: React.FC<{ breadcrumbs: string[] }> = ({ breadcrumbs }) => {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const translate = useTranslation();
  return (
    <Typography variant="h6" noWrap>
      {desktop ? translate(breadcrumbs[0]) : breadcrumbs.map((b) => translate(b)).join(' / ')}
    </Typography>
  );
};

/**
 * 響應式頁面佈局
 *
 * @param menu - 側邊導航選單
 * @param breadcrumbs - 麵包屑路徑
 * @param children - 頁面內容
 */
export const PageLayout: React.FC<{
  menu: React.ReactNode;
  breadcrumbs: string[];
  children: React.ReactNode;
}> = ({ menu, breadcrumbs, children }) => {
  const [miniVariant, setMiniVariant] = useState(false);
  const { classes } = useStyles({ miniVariant });
  const theme = useTheme();
  const navigate = useNavigate();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const [searchParams] = useSearchParams();
  const [openDrawer, setOpenDrawer] = useState(!desktop && searchParams.has('menu'));

  const toggleDrawer = () => setMiniVariant(!miniVariant);

  return (
    <div className={classes.root}>
      {/* 桌機 Drawer */}
      {desktop ? (
        <Drawer
          variant="permanent"
          className={classes.desktopDrawer}
          slotProps={{ paper: { className: classes.desktopDrawer } }}
        >
          <Toolbar>
            {!miniVariant && (
              <>
                <IconButton color="inherit" edge="start" onClick={() => navigate('/')}>
                  <span>←</span>
                </IconButton>
                <PageTitle breadcrumbs={breadcrumbs} />
              </>
            )}
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
            >
              {miniVariant ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Toolbar>
          <Divider />
          {menu}
        </Drawer>
      ) : (
        /* 手機 Drawer */
        <Drawer
          variant="temporary"
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          slotProps={{ paper: { className: classes.mobileDrawer } }}
        >
          {menu}
        </Drawer>
      )}
      {/* 手機 AppBar */}
      {!desktop && (
        <AppBar className={classes.mobileToolbar} position="static" color="inherit">
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={() => setOpenDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <PageTitle breadcrumbs={breadcrumbs} />
          </Toolbar>
        </AppBar>
      )}
      <div className={classes.content}>{children}</div>
    </div>
  );
};
