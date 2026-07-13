/**
 * 新增自訂屬性對話框
 *
 * 讓使用者輸入屬性名稱與型別（string/number/boolean）。
 * 支援從已知屬性定義中選取預設選項。
 * 對應 FRONTME.md 7.19 AddAttributeDialog 章節。
 */

import React, { useState, useMemo } from 'react';
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
  Autocomplete,
  Box,
} from '@mui/material';
import type { AttributeDef } from '../../attributes/useDeviceAttributes';

interface AddAttributeDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (key: string, type: 'string' | 'number' | 'boolean') => void;
  /** 已知屬性定義列表（可選取預設選項） */
  definitions?: AttributeDef[];
}

/** 新增屬性對話框 */
export const AddAttributeDialog: React.FC<AddAttributeDialogProps> = ({ open, onClose, onAdd, definitions = [] }) => {
  const [key, setKey] = useState('');
  const [type, setType] = useState<'string' | 'number' | 'boolean'>('string');

  // 已存在的屬性 key 不要顯示
  const allDefs = useMemo(() => {
    // 合併自訂輸入與已知定義
    const customOption = { key: '__custom__', name: 'Custom Attribute...', type: 'string' as const };
    return [customOption, ...definitions];
  }, [definitions]);

  const [selectedDef, setSelectedDef] = useState<AttributeDef | null>(null);

  /** 選擇已知屬性定義 */
  const handleSelectDef = (def: AttributeDef | null) => {
    setSelectedDef(def);
    if (def && def.key !== '__custom__') {
      setKey(def.key);
      setType(def.type);
    } else if (!def || def.key === '__custom__') {
      setKey('');
      setType('string');
    }
  };

  const handleAdd = () => {
    if (!key.trim()) return;
    onAdd(key.trim(), type);
    setKey('');
    setType('string');
    setSelectedDef(null);
    onClose();
  };

  const handleClose = () => {
    setKey('');
    setType('string');
    setSelectedDef(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add Attribute</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Autocomplete
            size="small"
            options={allDefs}
            getOptionLabel={(option) => `${option.name} (${option.key})`}
            value={selectedDef}
            onChange={(_, newValue) => handleSelectDef(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Predefined Attribute" placeholder="Select or type custom..." />
            )}
            freeSolo={false}
            fullWidth
          />
          <TextField
            size="small"
            label="Attribute Key"
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setSelectedDef(null);
            }}
            autoFocus={!selectedDef}
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained" disabled={!key.trim()}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};
