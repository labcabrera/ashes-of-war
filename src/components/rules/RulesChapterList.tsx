/**
 * RulesChapterList — sidebar list of available rules chapters.
 * Highlights the currently selected chapter.
 */
import { Box, Button, List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { RulesChapter } from '../../types/rules';

interface Props {
  chapters: RulesChapter[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  variant?: 'list' | 'rail';
}

function chapterPath(chapter: RulesChapter, parentPath?: string) {
  return parentPath ? `${parentPath}/${chapter.id}` : chapter.id;
}

function flattenChapters(chapters: RulesChapter[], depth = 0, parentPath?: string): Array<{ chapter: RulesChapter; path: string; depth: number }> {
  return chapters.flatMap((chapter) => {
    const path = chapterPath(chapter, parentPath);
    return [
      { chapter, path, depth },
      ...(chapter.children ? flattenChapters(chapter.children, depth + 1, path) : []),
    ];
  });
}

export default function RulesChapterList({ chapters, selectedId, onSelect, variant = 'list' }: Props) {
  const { t } = useTranslation();

  if (variant === 'rail') {
    return (
      <Box component="nav" aria-label={t('rules.chapters')}>
        <Typography variant="overline" sx={{ px: 0.5, display: 'block', color: 'secondary.light', fontWeight: 800 }}>
          {t('rules.chapters')}
        </Typography>
        <Box sx={{ overflowX: 'auto', pb: 0.5 }}>
          <Stack direction="row" spacing={1} sx={{ minWidth: 'max-content' }}>
            {flattenChapters(chapters).map(({ chapter, path, depth }) => (
              <Button
                key={path}
                variant={path === selectedId ? 'contained' : 'outlined'}
                color={path === selectedId ? 'secondary' : 'inherit'}
                size="small"
                onClick={() => onSelect(path)}
                sx={{
                  minHeight: 40,
                  whiteSpace: 'nowrap',
                  px: depth === 0 ? 1.5 : 1.25,
                  opacity: depth === 0 ? 1 : 0.9,
                  borderRadius: 0.5,
                  textTransform: 'uppercase',
                  fontWeight: path === selectedId ? 800 : 700,
                }}
              >
                {t(chapter.titleKey)}
              </Button>
            ))}
          </Stack>
        </Box>
      </Box>
    );
  }

  const renderChapter = (chapter: RulesChapter, depth = 0, parentPath?: string) => {
    const path = chapterPath(chapter, parentPath);

    return (
      <Box key={path}>
        <ListItemButton
          selected={path === selectedId}
          onClick={() => onSelect(path)}
          sx={{
            minHeight: depth === 0 ? 40 : 34,
            pl: 2 + depth * 2.5,
            pr: 1.5,
            borderLeft: '3px solid',
            borderLeftColor: path === selectedId ? 'secondary.light' : 'transparent',
            '&.Mui-selected': {
              bgcolor: 'rgba(159, 176, 170, 0.14)',
              color: 'secondary.light',
            },
            '&.Mui-selected:hover': {
              bgcolor: 'rgba(159, 176, 170, 0.2)',
            },
          }}
        >
          <ListItemText
            primary={
              <Typography
                variant={depth === 0 ? 'body1' : 'body2'}
                sx={{
                  fontWeight: path === selectedId ? 800 : depth === 0 ? 650 : 500,
                  textTransform: depth === 0 ? 'uppercase' : 'none',
                  fontSize: depth === 0 ? '0.86rem' : '0.9rem',
                }}
              >
                {t(chapter.titleKey)}
              </Typography>
            }
          />
        </ListItemButton>
        {chapter.children?.map((child) => renderChapter(child, depth + 1, path))}
      </Box>
    );
  };

  return (
    <Box component="nav" aria-label={t('rules.chapters')}>
      <Typography
        variant="overline"
        sx={{
          px: 2,
          pt: 1.4,
          pb: 0.8,
          display: 'block',
          color: 'secondary.light',
          fontWeight: 800,
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
        }}
      >
        {t('rules.chapters')}
      </Typography>
      <List dense sx={{ py: 0.5 }}>
        {chapters.map((chapter) => renderChapter(chapter))}
      </List>
    </Box>
  );
}
