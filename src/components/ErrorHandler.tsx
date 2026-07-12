/**
 * 全域錯誤處理器
 * 
 * 從 Redux errors store 讀取錯誤，以 Snackbar 顯示。
 * 對應 FRONTME.md 12.5 ErrorHandler.jsx 章節。
 */

import React, { useState } from 'react';
import {
  Snackbar,
  Alert,
  Link,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { usePrevious } from '../hooks/useAsyncTask';
import { errorsActions } from '../store';
import { useTranslation } from '../i18n/LocalizationProvider';

/**
 * 全域錯誤 Snackbar
 * 自動顯示 Redux store 中的錯誤訊息
 */
export const ErrorHandler: React.FC = () => {
  const dispatch = useAppDispatch();
  const t = useTranslation();

  const error = useAppSelector((state) => state.errors.errors.find(() => true));
  const cachedError = usePrevious(error);

  const message = error || cachedError;
  const multiline = message?.includes('\n');
  const displayMessage = multiline
    ? (message || '')
        .split('\n')[0]
        .replace(/^(?:(?:[\w$]+\.)*[\w$]+(?:Exception|Error)?:\s*)+/i, '')
    : message;

  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Snackbar open={Boolean(error) && !expanded}>
        <Alert
          elevation={6}
          onClose={() => dispatch(errorsActions.pop())}
          severity="error"
          variant="filled"
        >
          {displayMessage}
          {multiline && (
            <>
              {' | '}
              <Link
                color="inherit"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setExpanded(true);
                }}
              >
                {t('sharedShowDetails')}
              </Link>
            </>
          )}
        </Alert>
      </Snackbar>
      <Dialog open={expanded} onClose={() => setExpanded(false)} maxWidth={false}>
        <DialogContent>
          <DialogContentText component="div">
            <Typography component="pre" variant="caption">
              {message}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExpanded(false)} autoFocus>
            {t('sharedHide')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
