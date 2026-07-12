/**
 * 通用集合列表頁面元件
 *
 * 提供搜尋、無限滾動、表格列表、新增/編輯/刪除功能。
 * 對應 FRONTME.md 7. 多個列表頁面共用模式。
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, TextField, InputAdornment, Fab, Tooltip,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { PAGE_SIZE, useScrollToLoad } from '../../hooks/useAsyncTask';

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  search: {
    padding: theme.spacing(2),
  },
  tableContainer: {
    flex: 1,
    overflow: 'auto',
  },
  fab: {
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
  },
  sentinel: {
    height: 1,
  },
}));

/** 表格欄位定義 */
export interface CollectionColumn<T> {
  id: string;
  label: string;
  render: (item: T) => React.ReactNode;
  width?: string;
}

/** 集合頁面 Props */
interface CollectionPageProps<T extends { id: number }> {
  /** 標題 */
  title: string;
  /** 新增路徑 */
  addPath: string;
  /** 編輯路徑（接收 id） */
  editPath: (id: number) => string;
  /** 載入資料函式 */
  fetchData: (params: { limit: number; offset: number; keyword: string }) => Promise<T[]>;
  /** 刪除函式 */
  deleteItem: (id: number) => Promise<void>;
  /** 表格欄位定義 */
  columns: CollectionColumn<T>[];
  /** 側邊選單 */
  menu?: React.ReactNode;
}

/**
 * 通用集合列表頁面
 * 提供搜尋、無限滾動、CRUD 操作
 */
export function CollectionPage<T extends { id: number }>({
  title,
  addPath,
  editPath,
  fetchData,
  deleteItem,
  columns,
  menu,
}: CollectionPageProps<T>) {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const [items, setItems] = useState<T[]>([]);
  const [keyword, setKeyword] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const keywordTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 使用 ref 避免 stale closure 問題
  const fetchDataRef = useRef(fetchData);
  fetchDataRef.current = fetchData;

  /** 載入資料 */
  const loadData = useCallback(async (reset = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const currentOffset = reset ? 0 : offset;
      const result = await fetchDataRef.current({ limit: PAGE_SIZE, offset: currentOffset, keyword });
      setItems((prev) => (reset ? result : [...prev, ...result]));
      setOffset(currentOffset + result.length);
      setHasMore(result.length === PAGE_SIZE);
    } catch { /* ignore */ }
    setLoading(false);
    loadingRef.current = false;
  }, [offset, keyword]);

  // 初始載入
  useEffect(() => { loadData(true); }, []); // eslint-disable-line

  // 關鍵字搜尋（500ms debounce）+ cleanup
  useEffect(() => {
    if (keywordTimeoutRef.current) clearTimeout(keywordTimeoutRef.current);
    keywordTimeoutRef.current = setTimeout(() => {
      setOffset(0);
      setItems([]);
      loadData(true);
    }, 500);
    return () => {
      if (keywordTimeoutRef.current) clearTimeout(keywordTimeoutRef.current);
    };
  }, [keyword]); // eslint-disable-line

  // 無限滾動
  const sentinelRef = useScrollToLoad(hasMore ? () => loadData() : undefined);

  /** 刪除 */
  const handleDelete = async (id: number) => {
    await deleteItem(id);
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className={classes.root}>
      {menu}
      <div className={classes.search}>
        <TextField
          fullWidth
          size="small"
          placeholder={`Search ${title}...`}
          value={keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </div>
      <TableContainer className={classes.tableContainer}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id} style={{ width: col.width }}>
                  {col.label}
                </TableCell>
              ))}
              <TableCell width="100px">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} hover>
                {columns.map((col) => (
                  <TableCell key={col.id}>{col.render(item)}</TableCell>
                ))}
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => navigate(editPath(item.id))}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => handleDelete(item.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div ref={sentinelRef} className={classes.sentinel} />
      </TableContainer>
      <Fab className={classes.fab} color="primary" onClick={() => navigate(addPath)}>
        <AddIcon />
      </Fab>
    </div>
  );
}
