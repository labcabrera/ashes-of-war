/**
 * UnitList - renders unit cards or a compact selectable table.
 * Out-of-year units remain visible at reduced opacity (FR-019).
 */
import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Unit } from '../../types/unit';
import { allWeapons } from '../../data/weapons';
import { formatUnitKeyword } from '../../utils/unitKeywords';
import UnitCard from './UnitCard';

interface Props {
  units: Unit[];
  isOutOfYear: (unit: Unit) => boolean;
  viewMode: 'cards' | 'table';
  onSelect: (unit: Unit) => void;
}

const weaponsById = new Map(allWeapons.map((weapon) => [weapon.id, weapon.name]));

function movementSummary(unit: Unit) {
  return (['tactical', 'cruise', 'dash'] as const)
    .map((speed) => {
      const profile = unit.movement[speed];
      return `${speed.charAt(0).toUpperCase()}: ${profile.road}/${profile.crossCountry}/${profile.rough}`;
    })
    .join(' · ');
}

function armourSummary(unit: Unit) {
  if (!unit.profile) return '-';
  const { front, side, rear, exposed } = unit.profile;
  return `${front.value}/${side.value}/${rear.value}/${exposed.value}`;
}

function thresholdsSummary(unit: Unit, t: ReturnType<typeof useTranslation>['t']) {
  const values = [
    `${t('units.detail.organizationThresholdShort')} ${unit.organizationThreshold}`,
  ];

  if ('casualtiesThreshold' in unit && unit.casualtiesThreshold !== undefined) {
    values.push(`${t('units.detail.casualtiesThresholdShort')} ${unit.casualtiesThreshold}`);
  }

  if (unit.type === 'infantry') {
    values.push(`${t('units.detail.combatants')} ${unit.combatants}`);
  }

  return values.join(' · ');
}

function resourceSummary(unit: Unit, t: ReturnType<typeof useTranslation>['t']) {
  const resources = Object.entries(unit.resourceCosts ?? {});
  if (resources.length === 0) return '-';

  return resources
    .map(([key, value]) => `${t(`army.resources.${key}`, { defaultValue: key })} ${value}`)
    .join(' · ');
}

function weaponSummary(unit: Unit) {
  const assignments = unit.weapons ?? [];
  if (assignments.length === 0) return '-';

  return assignments
    .map((assignment) => `${assignment.count} x ${weaponsById.get(assignment.id) ?? assignment.id}`)
    .join(' · ');
}

export default function UnitList({ units, isOutOfYear, viewMode, onSelect }: Props) {
  const { t } = useTranslation();
  const groupedUnits = useMemo(() => {
    const groups = new Map<Unit['type'], Unit[]>();
    for (const unit of units) {
      const group = groups.get(unit.type) ?? [];
      group.push(unit);
      groups.set(unit.type, group);
    }
    return [...groups.entries()].map(([type, items]) => ({
      type,
      label: t(`units.types.${type}`),
      items,
    }));
  }, [units, t]);

  if (units.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
        {t('units.noResults')}
      </Typography>
    );
  }

  if (viewMode === 'table') {
    return (
      <TableContainer component={Paper}>
        <Table size="small" aria-label={t('catalogue.tabs.units')} sx={{ minWidth: 1280 }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('common.name')}</TableCell>
              <TableCell>{t('common.faction')}</TableCell>
              <TableCell align="right">{t('common.cost')}</TableCell>
              <TableCell>{t('units.table.thresholds')}</TableCell>
              <TableCell>{t('units.detail.movement.title')}</TableCell>
              <TableCell>{t('units.detail.armour')}</TableCell>
              <TableCell>{t('units.detail.resources')}</TableCell>
              <TableCell>{t('units.detail.keywords')}</TableCell>
              <TableCell>{t('units.detail.weapons')}</TableCell>
              <TableCell>{t('units.detail.availability')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groupedUnits.map((group) => (
              <Fragment key={group.type}>
                <TableRow>
                  <TableCell
                    colSpan={10}
                    sx={{
                      bgcolor: 'action.hover',
                      color: 'secondary.main',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {group.label}
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({group.items.length})
                    </Typography>
                  </TableCell>
                </TableRow>
                {group.items.map((unit) => {
                  const outOfYear = isOutOfYear(unit);
                  const keywords = unit.keywords?.map((keyword) => formatUnitKeyword(keyword, t)).join(' · ') ?? '-';

                  return (
                    <TableRow key={unit.id} hover sx={{ opacity: outOfYear ? 0.38 : 1 }}>
                      <TableCell sx={{ minWidth: 220 }}>
                        <Button
                          onClick={() => onSelect(unit)}
                          sx={{ justifyContent: 'flex-start', textTransform: 'none', px: 0, textAlign: 'left' }}
                        >
                          {unit.name}
                        </Button>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{t(`factions.${unit.faction}`, unit.faction)}</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}>
                        {unit.cost}
                      </TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        <Typography variant="caption">{thresholdsSummary(unit, t)}</Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 185 }}>
                        <Typography variant="caption" title={t('units.table.movementHelp')}>
                          {movementSummary(unit)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="caption" title={t('units.table.armourHelp')}>
                          {armourSummary(unit)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 140 }}>
                        <Typography variant="caption">{resourceSummary(unit, t)}</Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 170 }}>
                        <Typography variant="caption">{keywords}</Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 260 }}>
                        <Typography variant="caption">{weaponSummary(unit)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${unit.from}-${unit.to}`}
                          size="small"
                          variant="outlined"
                          color={outOfYear ? 'warning' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
        gap: 2.5,
      }}
    >
      {units.map((unit) => (
        <UnitCard
          key={unit.id}
          unit={unit}
          isOutOfYear={isOutOfYear(unit)}
          onClick={() => onSelect(unit)}
        />
      ))}
    </Box>
  );
}
