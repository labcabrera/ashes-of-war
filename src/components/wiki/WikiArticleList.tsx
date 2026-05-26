/**
 * WikiArticleList renders the selectable table of contents for Wiki documents.
 */
import { Box, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { WikiArticle } from '../../types/wiki';

interface Props {
  articles: WikiArticle[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function WikiArticleList({ articles, selectedId, onSelect }: Props) {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="overline" sx={{ px: 2, pt: 1, display: 'block' }}>
        {t('wiki.articles')}
      </Typography>
      <List dense>
        {articles.map((article) => (
          <ListItemButton
            key={article.id}
            selected={article.id === selectedId}
            onClick={() => onSelect(article.id)}
          >
            <ListItemText primary={t(article.titleKey)} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
