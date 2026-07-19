/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SHEET_ID?: string;
  readonly PUBLIC_SITE_NAME?: string;
  readonly PUBLIC_SITE_TAGLINE?: string;
  readonly PUBLIC_SITE_DESCRIPTION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
