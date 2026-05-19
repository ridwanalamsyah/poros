/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SANITY_PROJECT_ID?: string;
  readonly VITE_SANITY_DATASET?: string;
  readonly VITE_SANITY_API_VERSION?: string;
  readonly VITE_SANITY_WRITE_TOKEN?: string;
  readonly VITE_BUTTONDOWN_USERNAME?: string;
  readonly VITE_DOKU_CHECKOUT_ENDPOINT?: string;
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
