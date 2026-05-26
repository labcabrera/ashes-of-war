/**
 * WikiPage displays the indexed collection of historical reference articles.
 */
import { useEffect, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WikiArticleList from '../components/wiki/WikiArticleList';
import { WikiIndex } from '../types/wiki';

export default function WikiPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('wiki.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {t('wiki.description')}
      </Typography>
      <Paper sx={{ maxWidth: 420 }}>
        {index ? (
          <WikiArticleList
            articles={index.articles}
            selectedId={null}
            onSelect={(id) => navigate(`/wiki/${id}`)}
          />
        ) : (
          <Typography sx={{ p: 2 }} color={error ? 'error' : 'text.secondary'}>
            {t(error ? 'common.error' : 'common.loading')}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
