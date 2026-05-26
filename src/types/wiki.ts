/**
 * Wiki domain types for the indexed historical AsciiDoc reference articles.
 */

/** A single Wiki article with Spanish content and an optional English localization. */
export interface WikiArticle {
  id: string;
  /** i18n key used to display the article title in navigation. */
  titleKey: string;
  files: {
    es: string;
    en?: string;
  };
}

/** Versioned article manifest loaded from public/content/wiki/index.json. */
export interface WikiIndex {
  _version: number;
  articles: WikiArticle[];
}
