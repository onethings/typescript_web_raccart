/**
 * 網路資訊頁面
 *
 * 檢視位置記錄中的基地台 (Cell Tower) 與 WiFi 存取點資訊。
 * 對應 FRONTME.md 9.2 NetworkPage 章節。
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Paper,
  TableContainer,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAsyncTask } from '../../hooks/useAsyncTask';
import { getPositions } from '../../api/endpoints';
import type { Position } from '../../types/models';

/** 基地台資訊 */
interface CellTower {
  mcc: number;
  mnc: number;
  lac: number;
  cid: number;
}

/** WiFi 存取點 */
interface WifiAccessPoint {
  macAddress: string;
  signalStrength?: number;
}

/** 網路資訊頁面 */
export const NetworkPage: React.FC = () => {
  const { positionId } = useParams<{ positionId: string }>();
  const navigate = useNavigate();
  const [position, setPosition] = useState<Position | null>(null);

  useAsyncTask(
    async ({ signal }) => {
      if (!positionId) return;
      const res = await getPositions({ id: [Number(positionId)] }, signal);
      if (res.data.length > 0) setPosition(res.data[0]);
    },
    [positionId],
  );

  const network = position?.network as Record<string, unknown> | undefined;
  const cellTowers = (network?.cellTowers as CellTower[]) || [];
  const wifiAccessPoints = (network?.wifiAccessPoints as WifiAccessPoint[]) || [];

  return (
    <>
      <AppBar position="static" color="default">
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Network Info - Position #{positionId}</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 2 }}>
        {cellTowers.length > 0 && (
          <>
            <Typography variant="subtitle1" gutterBottom>Cell Towers ({cellTowers.length})</Typography>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>MCC</TableCell>
                    <TableCell>MNC</TableCell>
                    <TableCell>LAC</TableCell>
                    <TableCell>CID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cellTowers.map((tower, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{tower.mcc}</TableCell>
                      <TableCell>{tower.mnc}</TableCell>
                      <TableCell>{tower.lac}</TableCell>
                      <TableCell>{tower.cid}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {wifiAccessPoints.length > 0 && (
          <>
            <Typography variant="subtitle1" gutterBottom>WiFi Access Points ({wifiAccessPoints.length})</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>MAC Address</TableCell>
                    <TableCell>Signal Strength</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {wifiAccessPoints.map((ap, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{ap.macAddress}</TableCell>
                      <TableCell>{ap.signalStrength ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {cellTowers.length === 0 && wifiAccessPoints.length === 0 && (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No network information available for this position.
          </Typography>
        )}
      </Container>
    </>
  );
};
