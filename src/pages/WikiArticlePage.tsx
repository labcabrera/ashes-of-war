/**
 * WikiArticlePage renders one Wiki article alongside responsive article navigation.
 */
import { useEffect, useState } from 'react';
import { Box, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WikiArticleList from '../components/wiki/WikiArticleList';
import WikiContent from '../components/wiki/WikiContent';
import { WikiIndex } from '../types/wiki';

export default function WikiArticlePage() {
  const { articleId } = useParams<{ articleId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [index, setIndex] = useState<WikiIndex | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/content/wiki/index.json')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<WikiIndex>;
      })
      .then((data) => setIndex(data))
      .catch(() => setError(true));
  }, []);

  const article = index?.articles.find((entry) => entry.id === articleId);
  const handleSelect = (id: string) => {
    navigate(`/wiki/${id}`);
  };

  const sidebar = index ? (
    <WikiArticleList
      articles={index.articles}
      selectedId={articleId ?? null}
      onSelect={handleSelect}
    />
  ) : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
      {isDesktop ? (
        <Paper sx={{ width: 300, flexShrink: 0, alignSelf: 'flex-start', position: 'sticky', top: 82 }}>
          {sidebar}
        </Paper>
      ) : (
        <Paper sx={{ p: 1, position: 'sticky', top: 58, zIndex: 1 }}>
          {index ? (
            <WikiArticleList
              articles={index.articles}
              selectedId={articleId ?? null}
              onSelect={handleSelect}
              variant="rail"
            />
          ) : null}
        </Paper>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {article ? (
          <WikiContent article={article} />
        ) : (
          <Typography sx={{ mt: 4 }} color={error ? 'error' : 'text.secondary'}>
            {error || (index && articleId) ? t('common.error') : t('common.loading')}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
