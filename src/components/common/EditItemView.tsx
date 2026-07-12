/**
 * 通用 CRUD 編輯頁面元件
 *
 * 依 :id 參數判斷新增或編輯，提供載入/取消/儲存功能。
 * 對應 FRONTME.md 7.2 EditItemView 章節。
 */

import React from 'react';
import { Container, Button, Accordion, AccordionSummary, AccordionDetails, Skeleton, Typography, TextField } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from './PageLayout';
import { useCatch, useAsyncTask } from '../../hooks/useAsyncTask';
import { useTranslation } from '../../i18n/LocalizationProvider';

const useStyles = makeStyles()((theme) => ({
  container: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(3),
    gap: theme.spacing(2),
  },
}));

interface EditItemViewProps<T> {
  /** API 端點名稱 (如 'users', 'devices') */
  endpoint: string;
  /** 目前編輯的項目 */
  item: T | null;
  /** 設定項目 */
  setItem: (item: T | null) => void;
  /** 預設項目（新增時使用） */
  defaultItem: T;
  /** 驗證函式 */
  validate: () => boolean;
  /** 儲存成功回呼 */
  onItemSaved?: (saved: T) => void;
  /** 側邊選單 */
  menu: React.ReactNode;
  /** 麵包屑 */
  breadcrumbs: string[];
  /** 子元件（表單內容） */
  children: React.ReactNode;
}

/**
 * 通用 CRUD 編輯頁面
 * 支援載入/建立/更新
 */
export function EditItemView<T extends { id?: number }>({
  endpoint,
  item,
  setItem,
  defaultItem,
  validate,
  onItemSaved,
  menu,
  breadcrumbs,
  children,
}: EditItemViewProps<T>) {
  const navigate = useNavigate();
  const { classes } = useStyles();
  const t = useTranslation();
  const { id } = useParams<{ id: string }>();

  // 載入資料
  useAsyncTask(
    async ({ signal }) => {
      if (!item) {
        if (id) {
          const response = await fetch(`/api/${endpoint}/${id}`, { signal });
          const data = await response.json();
          setItem(data);
        } else {
          setItem(defaultItem);
        }
      }
    },
    [id, item, defaultItem, endpoint, setItem],
  );

  /** 儲存 */
  const handleSave = useCatch(async () => {
    const url = id ? `/api/${endpoint}/${id}` : `/api/${endpoint}`;
    const method = id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });

    const saved = await response.json();
    if (onItemSaved) onItemSaved(saved);
    navigate(-1);
  });

  return (
    <PageLayout menu={menu} breadcrumbs={breadcrumbs}>
      <Container maxWidth="xs" className={classes.container}>
        {item ? (
          <>
            {children}
            <div className={classes.buttons}>
              <Button color="primary" variant="outlined" onClick={() => navigate(-1)}>
                {t('sharedCancel')}
              </Button>
              <Button
                color="primary"
                variant="contained"
                onClick={handleSave}
                disabled={!validate()}
              >
                {t('sharedSave')}
              </Button>
            </div>
          </>
        ) : (
          <Accordion defaultExpanded>
            <AccordionSummary>
              <Typography variant="subtitle1">
                <Skeleton width="10em" />
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} width="100%">
                  <TextField />
                </Skeleton>
              ))}
            </AccordionDetails>
          </Accordion>
        )}
      </Container>
    </PageLayout>
  );
}
