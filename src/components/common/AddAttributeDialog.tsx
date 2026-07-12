/**
 * 新增自訂屬性對話框
 *
 * 讓使用者輸入屬性名稱與型別（string/number/boolean）。
 * 對應 FRONTME.md 7.19 AddAttributeDialog 章節。
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

interface AddAttributeDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (key: string, type: 'string' | 'number' | 'boolean') => void;
}

/** 新增屬性對話框 */
export const AddAttributeDialog: React.FC<AddAttributeDialogProps> = ({ open, onClose, onAdd }) => {
  const [key, setKey] = useState('');
  const [type, setType] = useState<'string' | 'number' | 'boolean'>('string');

  const handleAdd = () => {
    if (!key.trim()) return;
    onAdd(key.trim(), type);
    setKey('');
    setType('string');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add Attribute</DialogTitle>
      <DialogContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
          <TextField
            size="small"
            label="Attribute Name"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoFocus
            fullWidth
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={type} label="Type" onChange={(e) => setType(e.target.value as 'string' | 'number' | 'boolean')}>
              <MenuItem value="string">String</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="boolean">Boolean</MenuItem>
            </Select>
          </FormControl>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained" disabled={!key.trim()}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};
