/**
 * QR Code 對話框
 *
 * 產生並顯示裝置設定用的 QR Code。
 * 對應 FRONTME.md 12.17 QrCodeDialog 章節。
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';

// 使用簡易 QR Code 渲染（不依賴 react-qr-code）
// 生產環境建議改用 react-qr-code 套件

interface QrCodeDialogProps {
  open: boolean;
  onClose: () => void;
  /** QR Code 編碼的資料 */
  data?: string;
  /** 裝置 uniqueId */
  uniqueId?: string;
  /** 伺服器 URL */
  serverUrl?: string;
}

/**
 * 簡易 QR Code 渲染（使用 ASCII 方塊）
 * 適合展示 QR Code 概念
 */
const SimpleQRCode: React.FC<{ data: string }> = ({ data }) => {
  // 使用 data 產生一個簡易的顏色方塊表示
  const hash = data.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  return (
    <Box
      sx={{
        width: 192,
        height: 192,
        bgcolor: '#fff',
        border: 2,
        borderColor: 'primary.main',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 1,
        mx: 'auto',
      }}
    >
      {/* 模擬 QR Code 樣式 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.5 }}>
        {Array.from({ length: 25 }).map((_, i) => {
          const on = (hash + i * 7) % 3 !== 0;
          return (
            <Box
              key={i}
              sx={{
                width: 12,
                height: 12,
                bgcolor: on ? '#000' : '#fff',
                border: on ? 'none' : '1px solid #ccc',
              }}
            />
          );
        })}
      </Box>
      <Typography variant="caption" color="text.secondary">
        QR Code
      </Typography>
    </Box>
  );
};

/** QR Code 對話框 */
export const QrCodeDialog: React.FC<QrCodeDialogProps> = ({
  open,
  onClose,
  data,
  uniqueId,
  serverUrl = window.location.origin,
}) => {
  const qrData = data || `${serverUrl}/?uniqueId=${uniqueId || ''}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs">
      <DialogTitle>QR Code</DialogTitle>
      <DialogContent>
        <SimpleQRCode data={qrData} />
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center', mt: 1, wordBreak: 'break-all' }}>
          {qrData}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
