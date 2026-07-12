/**
 * 刪除確認對話框
 *
 * 刪除前顯示確認 Snackbar，執行 API 刪除後回呼。
 * 對應 FRONTME.md 12.18 RemoveDialog 章節。
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
} from '@mui/material';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { useCatch } from '../../hooks/useAsyncTask';

interface RemoveDialogProps {
  /** 對話框開啟 */
  open: boolean;
  /** 關閉回呼 */
  onClose: () => void;
  /** 刪除後的確認回呼 */
  onRemove: (confirmed: boolean) => Promise<void>;
  /** 項目名稱 */
  itemName?: string;
  /** API 端點 */
  endpoint?: string;
  /** 項目 ID */
  itemId?: number;
}

/**
 * 刪除確認對話框元件
 * 顯示確認文字，呼叫 DELETE API，回呼結果
 */
export const RemoveDialog: React.FC<RemoveDialogProps> = ({
  open,
  onClose,
  onRemove,
  itemName = 'this item',
  endpoint,
  itemId,
}) => {
  const t = useTranslation();
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleConfirm = useCatch(async () => {
    if (endpoint && itemId != null) {
      const res = await fetch(`/api/${endpoint}/${itemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Failed to delete ${itemName}`);
    }
    setSnackbarOpen(true);
    setTimeout(() => {
      onRemove(true);
      onClose();
    }, 500);
  });

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {itemName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('sharedCancel')}</Button>
          <Button onClick={handleConfirm} color="error" variant="contained">
            {t('sharedDelete')}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1500}
        message={`${itemName} deleted`}
      />
    </>
  );
};
