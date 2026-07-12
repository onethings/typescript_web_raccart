/**
 * 國際化 (i18n) 提供者
 * 
 * 支援 61 語系、自動偵測瀏覽器語言、RTL 支援。
 * 對應 FRONTME.md 12.10 LocalizationProvider.jsx 章節。
 */

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import dayjs from 'dayjs';
import type { LocalizationContextValue } from '../types/ui';
import en from '../resources/l10n/en.json';
import 'dayjs/locale/en';

// ==================== 語言定義 ====================

const languageMeta: Record<string, { country: string; name: string }> = {
  af: { country: 'ZA', name: 'Afrikaans' },
  ar: { country: 'AE', name: 'العربية' },
  az: { country: 'AZ', name: 'Azərbaycan' },
  bg: { country: 'BG', name: 'Български' },
  bn: { country: 'BD', name: 'বাংলা' },
  ca: { country: 'ES', name: 'Català' },
  cs: { country: 'CZ', name: 'Čeština' },
  da: { country: 'DK', name: 'Dansk' },
  de: { country: 'DE', name: 'Deutsch' },
  el: { country: 'GR', name: 'Ελληνικά' },
  en: { country: 'US', name: 'English' },
  es: { country: 'ES', name: 'Español' },
  et: { country: 'EE', name: 'Eesti' },
  fa: { country: 'IR', name: 'فارسی' },
  fi: { country: 'FI', name: 'Suomi' },
  fr: { country: 'FR', name: 'Français' },
  gl: { country: 'ES', name: 'Galego' },
  he: { country: 'IL', name: 'עברית' },
  hi: { country: 'IN', name: 'हिन्दी' },
  hr: { country: 'HR', name: 'Hrvatski' },
  hu: { country: 'HU', name: 'Magyar' },
  hy: { country: 'AM', name: 'Հայերեն' },
  id: { country: 'ID', name: 'Bahasa Indonesia' },
  it: { country: 'IT', name: 'Italiano' },
  ja: { country: 'JP', name: '日本語' },
  ka: { country: 'GE', name: 'ქართული' },
  kk: { country: 'KZ', name: 'Қазақ' },
  km: { country: 'KH', name: 'ភាសាខ្មែរ' },
  ko: { country: 'KR', name: '한국어' },
  lo: { country: 'LA', name: 'ລາວ' },
  lt: { country: 'LT', name: 'Lietuvių' },
  lv: { country: 'LV', name: 'Latviešu' },
  mk: { country: 'MK', name: 'Македонски' },
  ml: { country: 'IN', name: 'മലയാളം' },
  mn: { country: 'MN', name: 'Монгол' },
  ms: { country: 'MY', name: 'Bahasa Melayu' },
  nb: { country: 'NO', name: 'Norsk Bokmål' },
  ne: { country: 'NP', name: 'नेपाली' },
  nl: { country: 'NL', name: 'Nederlands' },
  nn: { country: 'NO', name: 'Norsk Nynorsk' },
  pl: { country: 'PL', name: 'Polski' },
  pt: { country: 'PT', name: 'Português' },
  pt_BR: { country: 'BR', name: 'Português (Brasil)' },
  ro: { country: 'RO', name: 'Română' },
  ru: { country: 'RU', name: 'Русский' },
  si: { country: 'LK', name: 'සිංහල' },
  sk: { country: 'SK', name: 'Slovenčina' },
  sl: { country: 'SI', name: 'Slovenščina' },
  sq: { country: 'AL', name: 'Shqip' },
  sr: { country: 'RS', name: 'Српски' },
  sv: { country: 'SE', name: 'Svenska' },
  sw: { country: 'TZ', name: 'Kiswahili' },
  ta: { country: 'IN', name: 'தமிழ்' },
  th: { country: 'TH', name: 'ไทย' },
  tk: { country: 'TM', name: 'Türkmen' },
  tr: { country: 'TR', name: 'Türkçe' },
  uk: { country: 'UA', name: 'Українська' },
  uz: { country: 'UZ', name: 'Oʻzbek' },
  vi: { country: 'VN', name: 'Tiếng Việt' },
  zh: { country: 'CN', name: '中文' },
  zh_TW: { country: 'TW', name: '中文 (台灣)' },
};

// RTL 語系
const RTL_LANGUAGES = new Set(['ar', 'he', 'fa']);

// 動態載入翻譯檔
const loadTranslation = async (lang: string): Promise<Record<string, string>> => {
  try {
    return (await import(`../resources/l10n/${lang}.json`)) as Record<string, string>;
  } catch {
    // 嘗試只取前兩碼（如 zh_TW → zh）
    const short = lang.substring(0, 2);
    if (short !== lang) return loadTranslation(short);
    return {};
  }
};

// ==================== Context ====================

interface InternalLanguages {
  [key: string]: { country?: string; name?: string; data?: Record<string, string> };
}

const LocalizationContext = createContext<LocalizationContextValue>({
  languages: {},
  language: 'en',
  setLocalLanguage: () => {},
  direction: 'ltr',
});

export const useLocalization = (): LocalizationContextValue =>
  useContext(LocalizationContext);

export const useTranslation = (): ((key: string) => string) => {
  const { languages: langs, language } = useContext(LocalizationContext);
  return useCallback(
    (key: string) => {
      const langData = (langs as InternalLanguages)[language]?.data;
      return langData?.[key] ?? (langs as InternalLanguages).en?.data?.[key] ?? key;
    },
    [langs, language],
  );
};

// ==================== 預設語言偵測 ====================

const getDefaultLanguage = (): string => {
  const browserLanguages = window.navigator.languages
    ? [...window.navigator.languages]
    : [];
  const browserLanguage =
    (window.navigator as unknown as Record<string, string>).userLanguage ||
    window.navigator.language;
  browserLanguages.push(browserLanguage);
  browserLanguages.push(browserLanguage.substring(0, 2));

  const allCodes = Object.keys(languageMeta);
  for (let i = 0; i < browserLanguages.length; i += 1) {
    let lang = browserLanguages[i].replace('-', '_');
    if (allCodes.includes(lang)) return lang;
    if (lang.length > 2) {
      lang = lang.substring(0, 2);
      if (allCodes.includes(lang)) return lang;
    }
  }
  return 'en';
};

// ==================== Provider ====================

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>(() => {
    return window.localStorage.getItem('language') || getDefaultLanguage();
  });
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({
    en,
  });

  const direction = RTL_LANGUAGES.has(language) ? 'rtl' : 'ltr';

  // 載入翻譯
  useEffect(() => {
    if (!translations[language]) {
      loadTranslation(language).then((data) => {
        setTranslations((prev) => ({ ...prev, [language]: data }));
      });
    }
    // 設定 dayjs locale
    const short = language.substring(0, 2);
    import(`dayjs/locale/${short}.js`).then(() => {
      dayjs.locale(short);
    }).catch(() => {});
  }, [language, translations]);

  const setLocalLanguage = useCallback((lang: string) => {
    setLanguage(lang);
    window.localStorage.setItem('language', lang);
  }, []);

  useEffect(() => {
    document.dir = direction;
    try {
      dayjs.locale(language === 'zh_TW' ? 'zh-tw' : language.substring(0, 2));
    } catch { /* ignore */ }
  }, [language, direction]);

  const langs = useMemo(() => {
    const result: InternalLanguages = {};
    for (const [code, meta] of Object.entries(languageMeta)) {
      result[code] = {
        ...meta,
        data: translations[code],
      };
    }
    return result;
  }, [translations]);

  const value = useMemo<LocalizationContextValue>(
    () => ({ languages: langs, language, setLocalLanguage, direction }),
    [langs, language, setLocalLanguage, direction],
  );

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};
