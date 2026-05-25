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

export default function RulesChapterList({ chapters, selectedId, onSelect }: Props) {
  const { t } = useTranslation();
  return (
    <Box>
      <Typography variant="overline" sx={{ px: 2, pt: 1, display: 'block' }}>
        {t('rules.chapters')}
      </Typography>
      <List dense>
        {chapters.map((chapter) => (
          <ListItemButton
            key={chapter.id}
            selected={chapter.id === selectedId}
            onClick={() => onSelect(chapter.id)}
          >
            <ListItemText primary={t(chapter.titleKey)} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
