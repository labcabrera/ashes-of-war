/**
 * CampaignPage — placeholder for the future campaign mode.
 */
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function CampaignPage() {
  const { t } = useTranslation();
  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        {t('campaign.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {t('campaign.comingSoon')}
      </Typography>
    </Box>
  );
}
