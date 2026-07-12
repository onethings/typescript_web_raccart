/**
 * Vite 環境變數與圖片型別宣告
 *
 * 提供 Vite 特有的匯入型別支援。
 */

/// <reference types="vite/client" />

/** SVG 元件匯入型別 (vite-plugin-svgr) */
declare module '*.svg?react' {
  import React from 'react';
  const Component: React.FC<React.SVGProps<SVGSVGElement>>;
  export default Component;
}

/** SVG URL 匯入型別 */
declare module '*.svg' {
  const src: string;
  export default src;
}

/** PNG 圖片匯入型別 */
declare module '*.png' {
  const src: string;
  export default src;
}

/** JPG 圖片匯入型別 */
declare module '*.jpg' {
  const src: string;
  export default src;
}

/** MP3 音效匯入型別 */
declare module '*.mp3' {
  const src: string;
  export default src;
}

/** JSON 匯入型別 */
declare module '*.json' {
  const value: Record<string, unknown>;
  export default value;
}

/** PWA virtual module (vite-plugin-pwa) */
declare module 'virtual:pwa-register' {
  export function registerSW(options?: {
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegisteredSW?: (swUrl: string, registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: unknown) => void;
  }): (reloadPage?: boolean) => Promise<void>;
}

/** PWA register 虛擬模組型別 */
declare module 'virtual:pwa-register/react' {
  import React from 'react';
  interface UseRegisterSWOptions {
    onRegisteredSW?: (swUrl: string, registration?: ServiceWorkerRegistration) => void;
    onRegisterError?: (error: unknown) => void;
  }
  interface UseRegisterSWResult {
    needRefresh: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    offlineReady: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  }
  export function useRegisterSW(options?: UseRegisterSWOptions): UseRegisterSWResult;
}

/** Vite 環境變數型別 */
interface ImportMetaEnv {
  readonly VITE_APP_VERSION?: string;
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly glob: Record<string, () => Promise<Record<string, unknown>>>;
}
