/**
 * 服務條款對話框
 *
 * 要求使用者接受服務條款與隱私政策。
 * 對應 FRONTME.md 12.24 TermsDialog 章節。
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Link,
} from '@mui/material';
import { useAppSelector } from '../../hooks/useAppStore';

interface TermsDialogProps {
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

/** 服務條款接受對話框 */
export const TermsDialog: React.FC<TermsDialogProps> = ({ open, onAccept, onCancel }) => {
  const termsUrl = useAppSelector(
    (state) => state.session.server?.attributes?.termsUrl as string | undefined,
  );
  const privacyUrl = useAppSelector(
    (state) => state.session.server?.attributes?.privacyUrl as string | undefined,
  );

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Terms of Service</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please accept our Terms of Service and Privacy Policy to continue using this service.
        </DialogContentText>
        {termsUrl && (
          <DialogContentText sx={{ mt: 2 }}>
            <Link href={termsUrl} target="_blank" rel="noopener noreferrer">
              View Terms of Service
            </Link>
          </DialogContentText>
        )}
        {privacyUrl && (
          <DialogContentText>
            <Link href={privacyUrl} target="_blank" rel="noopener noreferrer">
              View Privacy Policy
            </Link>
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">Cancel</Button>
        <Button onClick={onAccept} variant="contained" color="primary">Accept</Button>
      </DialogActions>
    </Dialog>
  );
};
