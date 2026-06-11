/**
 * RulesContent - renders AsciiDoc rules chapters using the official Asciidoctor.js library.
 */
import { useMemo, useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Link,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RulesChapter } from '../../types/rules';
import { convertToHtml, asciidocSx } from '../../utils/asciidoc';
import { useRouterLinks } from '../../hooks/useRouterLinks';

interface Props {
  chapter: RulesChapter;
  basePath: string;
}

export default function RulesContent({ chapter, basePath }: Props) {
  const { i18n, t } = useTranslation();
  const contentRef = useRouterLinks();

  type ChapterState = { key: string; content: string | null; error: boolean };
  const [chapterState, setChapterState] = useState<ChapterState>({ key: '', content: null, error: false });

  const lang = i18n.resolvedLanguage ?? 'en';
  const chapterKey = `${chapter.id}-${lang}`;
  const loading = chapterState.key !== chapterKey;
  const content = loading ? null : chapterState.content;
  const error = loading ? false : chapterState.error;
  const html = useMemo(() => (content ? convertToHtml(content) : ''), [content]);

  useEffect(() => {
    let cancelled = false;
    const currentLang = i18n.resolvedLanguage ?? 'en';
    const url = currentLang === 'es' && chapter.files?.es ? chapter.files.es : chapter.files?.en;
    const key = `${chapter.id}-${currentLang}`;
    if (!url) {
      Promise.resolve().then(() => {
        if (!cancelled) setChapterState({ key, content: '', error: false });
      });
      return () => {
        cancelled = true;
      };
    }
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setChapterState({ key, content: text, error: false });
      })
      .catch(() => {
        if (!cancelled) setChapterState({ key, content: null, error: true });
      });
    return () => {
      cancelled = true;
    };
  }, [chapter, i18n.resolvedLanguage]);

  if (loading) return <CircularProgress sx={{ m: 4 }} />;
  if (error || content === null) {
    return (
      <Typography color="error" sx={{ m: 2 }}>
        {t('common.error')}
      </Typography>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: { md: 960, lg: 1280, xl: 1520 }, px: 2, pb: 4 }}>
      <Box ref={contentRef} sx={asciidocSx} dangerouslySetInnerHTML={{ __html: html }} />
      {chapter.children && chapter.children.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('rules.subchapters')}
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 0 }}>
            {chapter.children.map((child) => (
              <Typography key={child.id} component="li" variant="body1" sx={{ mb: 0.75 }}>
                <Link component={RouterLink} to={`/rules/${basePath}/${child.id}`}>
                  {t(child.titleKey)}
                </Link>
              </Typography>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
