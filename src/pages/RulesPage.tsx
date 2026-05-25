/**
 * RulesPage — displays the rules chapter list.
 * On desktop, clicking a chapter navigates to /rules/:chapterId.
 */
import { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RulesChapterList from '../components/rules/RulesChapterList';
import { RulesIndex } from '../types/rules';

export default function RulesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [index, setIndex] = useState<RulesIndex | null>(null);

  useEffect(() => {
    fetch('/content/rules/index.json')
      .then((r) => r.json())
      .then((data: RulesIndex) => setIndex(data))
      .catch(() => setIndex(null));
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('rules.title')}
      </Typography>
      <Paper sx={{ maxWidth: 360 }}>
        {index ? (
          <RulesChapterList
            chapters={index.chapters}
            selectedId={null}
            onSelect={(id) => navigate(`/rules/${id}`)}
          />
        ) : (
          <Typography sx={{ p: 2 }} color="text.secondary">
            {t('common.loading')}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
