/**
 * RulesContent — renders a rules chapter markdown file using react-markdown.
 * Applies MUI typography overrides for consistent dark-theme styling.
 */
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, CircularProgress, Typography, Link, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { RulesChapter } from '../../types/rules';

interface Props {
  chapter: RulesChapter;
}

export default function RulesContent({ chapter }: Props) {
  const { i18n, t } = useTranslation();

  /** Single state keyed by chapterKey avoids synchronous setState in effect. */
  type ChapterState = { key: string; content: string | null; error: boolean };
  const [chapterState, setChapterState] = useState<ChapterState>({ key: '', content: null, error: false });

  const lang = i18n.resolvedLanguage ?? 'en';
  const chapterKey = `${chapter.id}-${lang}`;
  const loading = chapterState.key !== chapterKey;
  const content = loading ? null : chapterState.content;
  const error = loading ? false : chapterState.error;

  useEffect(() => {
    let cancelled = false;
    const currentLang = i18n.resolvedLanguage ?? 'en';
    const url = (currentLang === 'es' && chapter.files.es) ? chapter.files.es : chapter.files.en;
    const key = `${chapter.id}-${currentLang}`;
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
    return () => { cancelled = true; };
  }, [chapter, i18n.resolvedLanguage]);

  if (loading) return <CircularProgress sx={{ m: 4 }} />;
  if (error || content === null)
    return (
      <Typography color="error" sx={{ m: 2 }}>
        {t('common.error')}
      </Typography>
    );

  return (
    <Box sx={{ maxWidth: 800, px: 2, pb: 4 }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>{children}</Typography>,
          h2: ({ children }) => <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>{children}</Typography>,
          h3: ({ children }) => <Typography variant="h6" gutterBottom sx={{ mt: 1.5 }}>{children}</Typography>,
          p: ({ children }) => <Typography variant="body1" sx={{ mb: 2 }}>{children}</Typography>,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          a: (props: any) => <Link href={props.href as string | undefined}>{props.children}</Link>,
          hr: () => <Divider sx={{ my: 2 }} />,
          li: ({ children }) => (
            <Typography component="li" variant="body1" sx={{ mb: 0.5 }}>
              {children}
            </Typography>
          ),
          table: ({ children }) => (
            <Box sx={{ overflowX: 'auto', mb: 2 }}>
              <Box component="table" sx={{ borderCollapse: 'collapse', width: '100%' }}>
                {children}
              </Box>
            </Box>
          ),
          th: ({ children }) => (
            <Box
              component="th"
              sx={{
                px: 2,
                py: 1,
                borderBottom: '2px solid',
                borderColor: 'divider',
                textAlign: 'left',
                fontWeight: 600,
                bgcolor: 'background.paper',
              }}
            >
              {children}
            </Box>
          ),
          td: ({ children }) => (
            <Box
              component="td"
              sx={{
                px: 2,
                py: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              {children}
            </Box>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
}
