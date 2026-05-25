/**
 * ArmyBudgetBar — shows points progress and per-resource pool usage.
 * Displays an "over budget" warning chip when pointsOverBudget is true.
 */
import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ArmyBudget } from '../../types/army';

interface Props {
  budget: ArmyBudget;
}

export default function ArmyBudgetBar({ budget }: Props) {
  const { t } = useTranslation();
  const pct = Math.min(100, (budget.spentPoints / budget.totalPoints) * 100);

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="body2">
          {t('army.budget.points')}: {budget.spentPoints} / {budget.totalPoints}
        </Typography>
        {budget.pointsOverBudget && (
          <Chip label={t('army.budget.overBudget')} color="error" size="small" />
        )}
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={budget.pointsOverBudget ? 'error' : 'primary'}
        sx={{ height: 8, borderRadius: 1 }}
      />
      {budget.pools.map((pool) => (
        <Box key={pool.key} sx={{ display: 'flex', gap: 1, mt: 0.75, alignItems: 'center' }}>
          <Typography variant="caption" sx={{ minWidth: 90 }}>
            {t(pool.label)}:
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, (pool.spent / pool.max) * 100)}
            color={pool.spent > pool.max ? 'error' : 'secondary'}
            sx={{ flex: 1, height: 6, borderRadius: 1 }}
          />
          <Typography variant="caption">
            {pool.spent}/{pool.max}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
