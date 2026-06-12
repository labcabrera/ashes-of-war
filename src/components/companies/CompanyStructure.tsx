/**
 * CompanyStructure renders the command template for one company.
 */
import { Box, Card, CardContent, Chip, Paper, Stack, Typography } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ConstructionIcon from '@mui/icons-material/Construction';
import GroupsIcon from '@mui/icons-material/Groups';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import { useTranslation } from 'react-i18next';
import type { CompanySlotRole, CompanyType, CompanyUnitRule } from '../../types/company';
import { unitTypeIconUrl } from '../../utils/images';

const ROLE_ORDER: CompanySlotRole[] = ['captain', 'section', 'squad', 'support'];

const roleIcons = {
  captain: AccountTreeIcon,
  section: MilitaryTechIcon,
  squad: GroupsIcon,
  support: ConstructionIcon,
} satisfies Record<CompanySlotRole, typeof AccountTreeIcon>;

function groupedRules(company: CompanyType): Record<CompanySlotRole, CompanyUnitRule[]> {
  return ROLE_ORDER.reduce((acc, role) => {
    acc[role] = company.rules.filter((rule) => rule.role === role);
    return acc;
  }, {} as Record<CompanySlotRole, CompanyUnitRule[]>);
}

function RuleCard({ rule }: { rule: CompanyUnitRule }) {
  const { t } = useTranslation();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 1,
        bgcolor: 'grey.900',
        color: 'common.white',
        borderColor: 'rgba(255,255,255,0.22)',
      }}
    >
      <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
          <Box
            component="img"
            src={unitTypeIconUrl(rule.unitType)}
            alt=""
            aria-hidden="true"
            sx={{ width: 34, height: 34, objectFit: 'contain', flexShrink: 0 }}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {rule.label}
            </Typography>
            <Typography variant="caption" sx={{ color: 'grey.300' }}>
              {t(`units.types.${rule.unitType}`)}
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 0.75 }}>
              <Chip size="small" label={`${t('companies.rules.min')}: ${rule.min}`} />
              <Chip size="small" label={`${t('companies.rules.max')}: ${rule.max}`} />
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function CompanyStructure({ company }: { company: CompanyType }) {
  const { t } = useTranslation();
  const rulesByRole = groupedRules(company);

  return (
    <Box
      sx={{
        p: { xs: 1, md: 2 },
        bgcolor: 'rgba(119, 126, 94, 0.16)',
        border: '1px solid',
        borderColor: 'divider',
        overflowX: 'auto',
      }}
    >
      <Box
        sx={{
          minWidth: 940,
          display: 'grid',
          gridTemplateColumns: '1fr 1.15fr 1.15fr 1.55fr',
          gap: 1.5,
          alignItems: 'start',
        }}
      >
        {ROLE_ORDER.map((role) => {
          const Icon = roleIcons[role];
          return (
            <Paper
              key={role}
              variant="outlined"
              sx={{
                p: 1.25,
                minHeight: 220,
                bgcolor: role === 'support' ? 'grey.800' : 'rgba(28, 32, 24, 0.9)',
                borderColor: 'divider',
              }}
            >
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Icon fontSize="small" color="secondary" />
                  <Typography variant="overline" sx={{ lineHeight: 1.2 }}>
                    {t(`companies.roles.${role}`)}
                  </Typography>
                </Stack>
                {rulesByRole[role].map((rule) => (
                  <RuleCard key={rule.id} rule={rule} />
                ))}
              </Stack>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
