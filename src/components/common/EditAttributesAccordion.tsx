/**
 * 動態屬性編輯器 Accordion
 *
 * 新增/刪除/編輯自訂屬性，支援 string/number/boolean 型別。
 * 對應 FRONTME.md 7.19 EditAttributesAccordion 章節。
 */

import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { AddAttributeDialog } from './AddAttributeDialog';

interface EditAttributesAccordionProps {
  /** 屬性物件 */
  attributes: Record<string, unknown>;
  /** 更新屬性回呼 */
  onChange: (attributes: Record<string, unknown>) => void;
  /** 標題 */
  title?: string;
}

/**
 * 動態屬性編輯器
 * 可新增/刪除/編輯 string/number/boolean 型別的屬性
 */
export const EditAttributesAccordion: React.FC<EditAttributesAccordionProps> = ({
  attributes,
  onChange,
  title = 'Attributes',
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  /** 更新單一屬性值 */
  const handleUpdate = (key: string, value: unknown) => {
    onChange({ ...attributes, [key]: value });
  };

  /** 刪除屬性 */
  const handleDelete = (key: string) => {
    const newAttrs = { ...attributes };
    delete newAttrs[key];
    onChange(newAttrs);
  };

  /** 新增屬性 */
  const handleAdd = (key: string, type: 'string' | 'number' | 'boolean') => {
    const defaultValue = type === 'boolean' ? false : type === 'number' ? 0 : '';
    onChange({ ...attributes, [key]: defaultValue });
  };

  return (
    <>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{title}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            {Object.entries(attributes).map(([key, value]) => (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ minWidth: 100, fontWeight: 500 }}>
                  {key}
                </Typography>
                {typeof value === 'boolean' ? (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={value}
                        onChange={(e) => handleUpdate(key, e.target.checked)}
                        size="small"
                      />
                    }
                    label={value ? 'Yes' : 'No'}
                  />
                ) : typeof value === 'number' ? (
                  <TextField
                    size="small"
                    type="number"
                    value={value}
                    onChange={(e) => handleUpdate(key, parseFloat(e.target.value) || 0)}
                    fullWidth
                  />
                ) : (
                  <TextField
                    size="small"
                    value={String(value || '')}
                    onChange={(e) => handleUpdate(key, e.target.value)}
                    fullWidth
                  />
                )}
                <IconButton size="small" onClick={() => handleDelete(key)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button
              size="small"
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={() => setDialogOpen(true)}
            >
              Add Attribute
            </Button>
          </div>
        </AccordionDetails>
      </Accordion>
      <AddAttributeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAdd}
      />
    </>
  );
};
