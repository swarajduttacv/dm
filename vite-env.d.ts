// FIX: Removed redundant `ImportMeta` interface. The `vite/client` reference already defines it,
// and redeclaring it can cause type resolution errors. This file should only augment `ImportMetaEnv`.
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  // you can define more env variables here...
}
