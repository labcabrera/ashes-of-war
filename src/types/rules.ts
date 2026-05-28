/**
 * Rules domain types for Ashes of War.
 * Models the rules index and chapter structure served from public/content/rules/.
 */

/** A single rules chapter with language-specific file paths. */
export interface RulesChapter {
  id: string;
  /** i18n key used to display the chapter title. */
  titleKey: string;
  /** Language-to-file mapping. ES is optional; falls back to EN. */
  files?: {
    en: string;
    es?: string;
  };
  /** Optional nested subchapters displayed below this chapter. */
  children?: RulesChapter[];
}

/** Top-level rules index loaded from public/content/rules/index.json. */
export interface RulesIndex {
  _version: number;
  chapters: RulesChapter[];
}
