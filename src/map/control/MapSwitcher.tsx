/**
 * 地圖樣式/圖層切換器
 *
 * 切換地圖樣式、啟用/停用地圖圖層。
 * 對應 FRONTME.md 11.6 MapSwitcher 章節。
 */

import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListSubheader,
  Divider,
  Switch,
  FormControlLabel,
  Box,
  Typography,
} from '@mui/material';
import LayersIcon from '@mui/icons-material/Layers';
import { usePersistedState } from '../../utils/usePersistedState';

interface MapStyleOption {
  id: string;
  name: string;
}

interface MapSwitcherProps {
  /** 可用的地圖樣式 */
  styles: MapStyleOption[];
  /** 目前選取的樣式 ID */
  selectedId: string;
  /** 樣式選擇回呼 */
  onSelect: (id: string) => void;
  /** 可切換的圖層 */
  layers?: Array<{ id: string; name: string }>;
}

/**
 * 地圖樣式/圖層切換器
 * 浮動按鈕，點擊後顯示樣式選擇與圖層開關
 */
export const MapSwitcher: React.FC<MapSwitcherProps> = ({
  styles,
  selectedId,
  onSelect,
  layers = [],
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [hiddenLayers, setHiddenLayers] = usePersistedState<string[]>('hiddenMapLayers', []);

  const toggleLayer = (layerId: string) => {
    setHiddenLayers((prev) =>
      prev.includes(layerId)
        ? prev.filter((id) => id !== layerId)
        : [...prev, layerId],
    );
  };

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          position: 'absolute',
          top: 146,
          right: 8,
          zIndex: 10,
          bgcolor: 'background.paper',
          boxShadow: 1,
          '&:hover': { bgcolor: 'action.hover' },
        }}
        size="small"
      >
        <LayersIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <ListSubheader>Map Styles</ListSubheader>
        {styles.map((style) => (
          <MenuItem
            key={style.id}
            selected={selectedId === style.id}
            onClick={() => { onSelect(style.id); setAnchorEl(null); }}
          >
            {style.name}
          </MenuItem>
        ))}

        {layers.length > 0 && <Divider />}
        {layers.length > 0 && <ListSubheader>Layers</ListSubheader>}
        {layers.map((layer) => (
          <MenuItem key={layer.id} disableRipple>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={!hiddenLayers.includes(layer.id)}
                  onChange={() => toggleLayer(layer.id)}
                />
              }
              label={<Typography variant="body2">{layer.name}</Typography>}
              sx={{ width: '100%' }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
