/**
 * 位置詳情頁面
 *
 * 檢視單一位置的所有屬性。
 * 對應 FRONTME.md 9.1 PositionPage 章節。
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Container,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAsyncTask } from '../../hooks/useAsyncTask';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { PositionValue } from '../../components/common/PositionValue';
import type { Position } from '../../types/models';
import { getPositions } from '../../api/endpoints';

/** 位置詳情頁面 */
export const PositionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const [position, setPosition] = useState<Position | null>(null);

  useAsyncTask(
    async ({ signal }) => {
      const response = await getPositions({ id: id ? [Number(id)] : undefined }, signal);
      if (response.data.length > 0) setPosition(response.data[0]);
    },
    [id],
  );

  if (!position) return null;

  // 取得所有欄位（排除 attributes 物件）
  const fields = Object.entries(position).filter(
    ([key, value]) => key !== 'attributes' && key !== 'network' && value !== undefined,
  );

  const attributes = position.attributes as Record<string, unknown> | undefined;
  const attributeFields = attributes ? Object.entries(attributes) : [];

  return (
    <>
      <AppBar position="static" color="default">
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Position #{id}</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 2 }}>
        <Typography variant="subtitle1" gutterBottom>Fields</Typography>
        <Table size="small">
          <TableBody>
            {fields.map(([key, value]) => (
              <TableRow key={key}>
                <TableCell sx={{ fontWeight: 500, width: 200 }}>{key}</TableCell>
                <TableCell>
                  <PositionValue field={key} value={value} positionId={position.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {attributeFields.length > 0 && (
          <>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Attributes</Typography>
            <Table size="small">
              <TableBody>
                {attributeFields.map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell sx={{ fontWeight: 500, width: 200 }}>{key}</TableCell>
                    <TableCell>
                      <PositionValue field={key} value={value} positionId={position.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Container>
    </>
  );
};
