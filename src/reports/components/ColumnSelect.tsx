/**
 * 報表欄位多選元件
 *
 * 可展開/收合的多選欄位選擇器，用於報表頁面自訂顯示欄位。
 * 對應 FRONTME.md 8.3 ColumnSelect 章節。
 */

import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface ColumnOption {
  id: string;
  label: string;
}

interface ColumnSelectProps {
  title: string;
  columns: ColumnOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

/**
 * 報表欄位多選
 * 以 Accordion 方式展開的欄位選擇器
 */
export const ColumnSelect: React.FC<ColumnSelectProps> = ({
  title,
  columns,
  selected,
  onChange,
}) => {
  const handleToggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <Accordion variant="outlined" sx={{ '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2">
          {title} ({selected.length}/{columns.length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormGroup>
          {columns.map((col) => (
            <FormControlLabel
              key={col.id}
              control={
                <Checkbox
                  size="small"
                  checked={selected.includes(col.id)}
                  onChange={() => handleToggle(col.id)}
                />
              }
              label={<Typography variant="body2">{col.label}</Typography>}
            />
          ))}
        </FormGroup>
      </AccordionDetails>
    </Accordion>
  );
};
