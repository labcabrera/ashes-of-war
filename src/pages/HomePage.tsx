/**
 * HomePage — landing screen for Ashes of War.
 */
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h3" gutterBottom>
        {t('home.title')}
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {t('home.subtitle')}
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        {t('home.welcome')}
      </Typography>
    </Box>
  );
}
