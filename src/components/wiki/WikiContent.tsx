/**
 * WikiContent loads and renders AsciiDoc wiki articles using the official
 * Asciidoctor.js library.
 */
import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { WikiArticle } from '../../types/wiki';
import { convertToHtml, asciidocSx } from '../../utils/asciidoc';

interface Props {
  article: WikiArticle;
}

export default function WikiContent({ article }: Props) {
  const { i18n, t } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'es';
  const articleKey = `${article.id}-${language}`;
  const [state, setState] = useState<{ key: string; content: string | null; error: boolean }>({
    key: '',
    content: null,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;
    const requestedLanguage = i18n.resolvedLanguage ?? 'es';
    const url = requestedLanguage === 'en' && article.files.en ? article.files.en : article.files.es;
    const key = `${article.id}-${requestedLanguage}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then((content) => {
        if (!cancelled) setState({ key, content, error: false });
      })
      .catch(() => {
        if (!cancelled) setState({ key, content: null, error: true });
      });

    return () => { cancelled = true; };
  }, [article, i18n.resolvedLanguage]);

  if (state.key !== articleKey) return <CircularProgress sx={{ m: 4 }} />;
  if (state.error || state.content === null) {
    return <Typography color="error" sx={{ m: 2 }}>{t('common.error')}</Typography>;
  }

  const html = convertToHtml(state.content);

  return (
    <Box component="article" sx={{ maxWidth: 900, px: { xs: 1, sm: 2 }, pb: 4 }}>
      <Box sx={asciidocSx} dangerouslySetInnerHTML={{ __html: html }} />
    </Box>
  );
}
