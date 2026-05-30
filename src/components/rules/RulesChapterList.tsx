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
        <Typography variant="overline" sx={{ px: 0.5, display: 'block' }}>
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
          sx={{ pl: 2 + depth * 2.5 }}
        >
          <ListItemText
            primary={
              <Typography variant={depth === 0 ? 'body1' : 'body2'}>
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
      <Typography variant="overline" sx={{ px: 2, pt: 1, display: 'block' }}>
        {t('rules.chapters')}
      </Typography>
      <List dense>
        {chapters.map((chapter) => renderChapter(chapter))}
      </List>
    </Box>
  );
}
