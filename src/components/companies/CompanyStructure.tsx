/**
 * CompanyStructure renders a vertical formation tree for one company.
 */
import { Box, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { CompanySlotRole, CompanyType, CompanyUnitRule } from '../../types/company';
import { unitTypeIconUrl } from '../../utils/images';
import { useDisplaySettings } from '../../hooks/useDisplaySettings';

const ROLE_ORDER: CompanySlotRole[] = ['captain', 'section', 'squad', 'support'];

interface ExpandedRuleCard {
  key: string;
  rule: CompanyUnitRule;
  required: boolean;
}

function groupedRules(company: CompanyType): Record<CompanySlotRole, CompanyUnitRule[]> {
  return ROLE_ORDER.reduce((acc, role) => {
    acc[role] = company.rules.filter((rule) => rule.role === role);
    return acc;
  }, {} as Record<CompanySlotRole, CompanyUnitRule[]>);
}

function FormationCard({ rule, required }: { rule: CompanyUnitRule; required: boolean }) {
  const { t } = useTranslation();
  const { unitTypeIconStyle } = useDisplaySettings();

  return (
    <Paper
      variant="outlined"
      sx={{
        width: 166,
        minHeight: 92,
        overflow: 'hidden',
        borderRadius: 1,
        borderColor: required ? 'grey.900' : 'grey.400',
        bgcolor: required ? 'grey.900' : 'grey.300',
        color: required ? 'common.white' : 'grey.900',
        boxShadow: required ? '0 3px 0 rgba(0,0,0,0.35)' : 'none',
      }}
    >
      <Box sx={{ px: 0.75, py: 0.35, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {t(`companies.roles.${rule.role}`)}
        </Typography>
      </Box>
      <Box
        sx={{
          m: 0.55,
          px: 0.75,
          py: 0.55,
          minHeight: 64,
          bgcolor: 'grey.100',
          color: 'grey.900',
          clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.78rem',
              fontWeight: 900,
              lineHeight: 1.12,
              textTransform: 'uppercase',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {rule.label}
          </Typography>
          <Typography variant="caption" sx={{ color: 'grey.700', fontSize: '0.62rem' }}>
            {t(`units.types.${rule.unitType}`)}
          </Typography>
        </Box>
        <Box
          component="img"
          src={unitTypeIconUrl(rule.unitType, unitTypeIconStyle)}
          alt=""
          aria-hidden="true"
          sx={{
            width: 32,
            height: 32,
            objectFit: 'contain',
            flexShrink: 0,
            mr: 1.25,
            filter: required ? 'drop-shadow(0 2px 2px rgba(0,0,0,0.35))' : 'contrast(1.15) brightness(0.72)',
          }}
        />
      </Box>
    </Paper>
  );
}

function expandedRuleCards(rules: CompanyUnitRule[]): ExpandedRuleCard[] {
  return rules.flatMap((rule) => {
    const required = Array.from({ length: Math.max(0, rule.min) }, (_, index) => ({
      key: `${rule.id}-required-${index}`,
      rule,
      required: true,
    }));
    const optional = Array.from({ length: Math.max(0, rule.max - rule.min) }, (_, index) => ({
      key: `${rule.id}-optional-${index}`,
      rule,
      required: false,
    }));
    return [...required, ...optional];
  });
}

function RuleRow({ rules, stacked = false }: { rules: CompanyUnitRule[]; stacked?: boolean }) {
  const cards = expandedRuleCards(rules);

  return (
    <Box
      sx={{
        display: stacked ? 'flex' : 'grid',
        flexDirection: stacked ? 'column' : undefined,
        alignItems: 'flex-start',
        gridTemplateColumns: stacked ? undefined : 'repeat(auto-fit, minmax(166px, 166px))',
        justifyContent: 'start',
        gap: 1.25,
      }}
    >
      {cards.map((card) => (
        <FormationNode key={card.key} card={card} stackedChildren={stacked} />
      ))}
    </Box>
  );
}

function FormationNode({ card, stackedChildren = false }: { card: ExpandedRuleCard; stackedChildren?: boolean }) {
  const hasChildren = Boolean(card.rule.children && card.rule.children.length > 0);

  return (
    <Box sx={{ minWidth: 166 }}>
      <FormationCard rule={card.rule} required={card.required} />
      {hasChildren && (
        <Box
          sx={{
            mt: 1,
            ml: 1.25,
            pl: 1.25,
            borderLeft: '2px solid',
            borderLeftColor: card.required ? 'grey.700' : 'grey.400',
          }}
        >
          <RuleRow rules={card.rule.children ?? []} stacked={stackedChildren} />
        </Box>
      )}
    </Box>
  );
}

function SupportRows({ rules }: { rules: CompanyUnitRule[] }) {
  return (
    <Stack spacing={1.25} sx={{ alignItems: 'flex-start' }}>
      {rules.map((rule) => (
        <Box
          key={rule.id}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(166px, 166px))',
            justifyContent: 'start',
            gap: 1.25,
            width: '100%',
          }}
        >
          {expandedRuleCards([rule]).map((card) => (
            <FormationNode key={card.key} card={card} />
          ))}
        </Box>
      ))}
    </Stack>
  );
}

function TreeLevel({ rules, stacked = false }: { rules: CompanyUnitRule[]; stacked?: boolean }) {
  return (
    <Box>
      <RuleRow rules={rules} stacked={stacked} />
    </Box>
  );
}

function SectionTree({ rules }: { rules: CompanyUnitRule[] }) {
  const sectionCards = expandedRuleCards(rules);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(206px, 206px))',
        alignItems: 'start',
        justifyContent: 'start',
        gap: 1.75,
      }}
    >
      {sectionCards.map((card) => (
        <Box
          key={card.key}
          sx={{
            minWidth: 206,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 78,
              bottom: 0,
              left: 10,
              width: '2px',
              bgcolor: card.required ? 'grey.700' : 'grey.400',
            },
          }}
        >
          <FormationCard rule={card.rule} required={card.required} />
          {card.rule.children && card.rule.children.length > 0 && (
            <Stack spacing={1.15} sx={{ mt: 1.15, pl: 2.25 }}>
              {expandedRuleCards(card.rule.children).map((childCard) => (
                <SectionChildNode key={childCard.key} card={childCard} />
              ))}
            </Stack>
          )}
        </Box>
      ))}
    </Box>
  );
}

function SectionChildNode({ card }: { card: ExpandedRuleCard }) {
  const hasChildren = Boolean(card.rule.children && card.rule.children.length > 0);

  return (
    <Box
      sx={{
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 38,
          left: -26,
          width: 22,
          borderTop: '2px solid',
          borderColor: card.required ? 'grey.700' : 'grey.400',
        },
      }}
    >
      <FormationCard rule={card.rule} required={card.required} />
      {hasChildren && (
        <Stack spacing={0.9} sx={{ mt: 0.9, pl: 1.8, borderLeft: '2px solid', borderLeftColor: card.required ? 'grey.700' : 'grey.400' }}>
          {expandedRuleCards(card.rule.children ?? []).map((grandChildCard) => (
            <FormationNode key={grandChildCard.key} card={grandChildCard} stackedChildren />
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default function CompanyStructure({ company }: { company: CompanyType }) {
  const { t } = useTranslation();
  const rulesByRole = groupedRules(company);
  const hqRules = rulesByRole.captain;
  const sectionRules = rulesByRole.section;
  const squadRules = rulesByRole.squad;
  const supportRules = rulesByRole.support;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, md: 2.5 },
        bgcolor: 'grey.100',
        color: 'grey.900',
        borderColor: 'grey.500',
        overflowX: 'auto',
      }}
    >
      <Box sx={{ minWidth: { xs: 820, lg: 1120 } }}>
        <Box
          sx={{
            mb: 2,
            py: 1,
            px: 2,
            bgcolor: 'grey.900',
            color: 'common.white',
            textAlign: 'center',
            borderRadius: 0.75,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {company.name}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {t(`units.types.${company.classification}`)}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', fontStyle: 'italic', color: 'grey.700' }}>
          {company.description}
        </Typography>

        <Box sx={{ pr: { xs: 0, md: 2 } }}>
          <Stack spacing={1.5} sx={{ alignItems: 'stretch' }}>
            <TreeLevel rules={hqRules} />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: supportRules.length > 0 ? 'minmax(0, 1fr) 220px' : '1fr' },
                alignItems: 'start',
                gap: 2,
              }}
            >
              <Stack spacing={1.5}>
                {sectionRules.length > 0 && <SectionTree rules={sectionRules} />}
                {squadRules.length > 0 && <TreeLevel rules={squadRules} />}
              </Stack>

              {supportRules.length > 0 && (
                <Box
                  sx={{
                    position: { lg: 'sticky' },
                    top: { lg: 86 },
                    borderLeft: { lg: '3px solid' },
                    borderLeftColor: { lg: 'grey.600' },
                    pl: { lg: 1.5 },
                  }}
                >
                  <Box
                    sx={{
                      mb: 1,
                      py: 0.45,
                      px: 1.25,
                      bgcolor: 'grey.800',
                      color: 'common.white',
                      borderRadius: 0.75,
                      width: '100%',
                    }}
                  >
                    <Typography variant="overline" sx={{ fontWeight: 900, letterSpacing: '0.12em' }}>
                      {t('companies.roles.support')}
                    </Typography>
                  </Box>
                  <SupportRows rules={supportRules} />
                </Box>
              )}
            </Box>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}
