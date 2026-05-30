/**
 * WikiArticleList renders the selectable table of contents for Wiki documents.
 */
import { Box, Button, List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { WikiArticle } from '../../types/wiki';

interface Props {
  articles: WikiArticle[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  variant?: 'list' | 'rail';
}

export default function WikiArticleList({ articles, selectedId, onSelect, variant = 'list' }: Props) {
  const { t } = useTranslation();

  if (variant === 'rail') {
    return (
      <Box component="nav" aria-label={t('wiki.articles')}>
        <Typography variant="overline" sx={{ px: 0.5, display: 'block' }}>
          {t('wiki.articles')}
        </Typography>
        <Box sx={{ overflowX: 'auto', pb: 0.5 }}>
          <Stack direction="row" spacing={1} sx={{ minWidth: 'max-content' }}>
            {articles.map((article) => (
              <Button
                key={article.id}
                variant={article.id === selectedId ? 'contained' : 'outlined'}
                color={article.id === selectedId ? 'secondary' : 'inherit'}
                size="small"
                onClick={() => onSelect(article.id)}
                sx={{ minHeight: 40, whiteSpace: 'nowrap', px: 1.5 }}
              >
                {t(article.titleKey)}
              </Button>
            ))}
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box component="nav" aria-label={t('wiki.articles')}>
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
