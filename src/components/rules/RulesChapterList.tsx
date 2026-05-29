/**
 * RulesChapterList — sidebar list of available rules chapters.
 * Highlights the currently selected chapter.
 */
import { List, ListItemButton, ListItemText, Typography, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { RulesChapter } from '../../types/rules';

interface Props {
  chapters: RulesChapter[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function chapterPath(chapter: RulesChapter, parentPath?: string) {
  return parentPath ? `${parentPath}/${chapter.id}` : chapter.id;
}

export default function RulesChapterList({ chapters, selectedId, onSelect }: Props) {
  const { t } = useTranslation();

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
    <Box>
      <Typography variant="overline" sx={{ px: 2, pt: 1, display: 'block' }}>
        {t('rules.chapters')}
      </Typography>
      <List dense>
        {chapters.map((chapter) => renderChapter(chapter))}
      </List>
    </Box>
  );
}
