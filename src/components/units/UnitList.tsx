/**
 * UnitList - renders unit cards or a compact selectable table.
 * Out-of-year units remain visible at reduced opacity (FR-019).
 */
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import ShieldIcon from '@mui/icons-material/Shield';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Unit, UnitWeapon } from '../../types/unit';
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
const weaponsByCatalogueId = new Map(allWeapons.map((weapon) => [weapon.id, weapon]));
const resourceIcons = {
  fuel: LocalGasStationIcon,
  logistics: WarehouseIcon,
  intelligence: PsychologyAltIcon,
} as const;

function movementSummary(unit: Unit) {
  return (['tactical', 'cruise', 'dash'] as const)
    .map((speed) => {
      const profile = unit.movement[speed];
      return `${speed.charAt(0).toUpperCase()}: ${profile.road}/${profile.crossCountry}/${profile.rough}`;
    })
    .join(' · ');
}

function armourSummary(unit: Unit) {
  if (!unit.armor) return '-';
  const { front, side, rear, exposed } = unit.armor;
  return `${front.value}/${side.value}/${rear.value}/${exposed.value}`;
}

function weaponSummary(unit: Unit) {
  const assignments = unit.weapons ?? [];
  if (assignments.length === 0) return '-';

  return assignments
    .map((assignment) => `${assignment.count} x ${weaponsById.get(assignment.id) ?? assignment.id}`)
    .join(' · ');
}

function weaponName(assignment: UnitWeapon) {
  return weaponsById.get(assignment.id) ?? assignment.id;
}

function CostResourcesCell({ unit }: { unit: Unit }) {
  const { t } = useTranslation();
  const resources = Object.entries(unit.resourceCosts ?? {});

  return (
    <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap', minWidth: 150 }}>
      <Tooltip title={t('common.cost')}>
        <Chip
          icon={<MilitaryTechIcon />}
          label={unit.cost}
          size="small"
          color="secondary"
          variant="outlined"
          aria-label={`${t('common.cost')}: ${unit.cost}`}
        />
      </Tooltip>
      {resources.map(([resource, value]) => {
        const Icon = resourceIcons[resource as keyof typeof resourceIcons] ?? WarehouseIcon;
        const label = t(`army.resources.${resource}`, { defaultValue: resource });

        return (
          <Tooltip key={resource} title={label}>
            <Chip
              icon={<Icon />}
              label={value}
              size="small"
              variant="outlined"
              aria-label={`${label}: ${value}`}
            />
          </Tooltip>
        );
      })}
    </Stack>
  );
}

function ProfileValue({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldIcon;
  label: string;
  value?: number | string;
}) {
  return (
    <Tooltip title={label}>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
        <Icon sx={{ fontSize: 18, color: value === undefined ? 'text.disabled' : 'secondary.main' }} />
        <Typography
          component="span"
          variant="body2"
          aria-label={`${label}: ${value ?? '-'}`}
          sx={{ minWidth: 24, fontWeight: value === undefined ? 400 : 700, color: value === undefined ? 'text.disabled' : 'text.primary' }}
        >
          {value ?? '-'}
        </Typography>
      </Stack>
    </Tooltip>
  );
}

function EquippedWeaponsTable({ unitId, assignments }: { unitId: string; assignments: UnitWeapon[] }) {
  const { t } = useTranslation();
  const weapons = assignments
    .map((assignment) => ({ assignment, weapon: weaponsByCatalogueId.get(assignment.id) }))
    .filter(({ weapon }) => Boolean(weapon));
  const hasPenetration = weapons.some(({ weapon }) =>
    weapon?.profiles.some((profile) => profile.armourPenetration !== undefined),
  );
  const hasSuppression = weapons.some(({ weapon }) =>
    weapon?.profiles.some((profile) => profile.suppressionModifier !== undefined),
  );
  const hasCharacteristics = weapons.some(({ weapon }) =>
    weapon?.profiles.some((profile) => profile.characteristics?.length),
  );

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label={t('units.table.equippedWeapons')} sx={{ minWidth: 980 }}>
        <TableHead>
          <TableRow>
            <TableCell>{t('units.table.weapon')}</TableCell>
            <TableCell>{t('units.table.mount')}</TableCell>
            <TableCell>{t('weapons.fireType')}</TableCell>
            <TableCell align="right">{t('weapons.shots')}</TableCell>
            <TableCell align="right">{t('weapons.hitOn')}</TableCell>
            <TableCell>{t('weapons.range')}</TableCell>
            {hasPenetration && <TableCell align="right">{t('weapons.penetration')}</TableCell>}
            {hasSuppression && <TableCell align="right">{t('weapons.suppression')}</TableCell>}
            {hasCharacteristics && <TableCell>{t('weapons.characteristics')}</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {assignments.flatMap((assignment) => {
            const weapon = weaponsByCatalogueId.get(assignment.id);

            if (!weapon) {
              return [
                <TableRow key={`${unitId}-${assignment.type}-${assignment.id}-missing`}>
                  <TableCell>{assignment.count} x {weaponName(assignment)}</TableCell>
                  <TableCell>{t(`units.weaponMounts.${assignment.type}`)}</TableCell>
                  <TableCell colSpan={4 + Number(hasPenetration) + Number(hasSuppression) + Number(hasCharacteristics)}>
                    <Typography variant="caption" color="text.secondary">
                      {t('units.detail.weaponUnavailable')}
                    </Typography>
                  </TableCell>
                </TableRow>,
              ];
            }

            return weapon.profiles.map((profile, index) => (
              <TableRow key={`${unitId}-${assignment.type}-${assignment.id}-${profile.id}`}>
                <TableCell sx={{ minWidth: 200, fontWeight: index === 0 ? 700 : 400 }}>
                  {index === 0 ? `${assignment.count} x ${weapon.name}` : ''}
                </TableCell>
                <TableCell sx={{ minWidth: 120 }}>
                  {index === 0 ? (
                    <Chip label={t(`units.weaponMounts.${assignment.type}`)} size="small" variant="outlined" />
                  ) : null}
                </TableCell>
                <TableCell>{profile.name}</TableCell>
                <TableCell align="right">{profile.shots}</TableCell>
                <TableCell align="right">{profile.hitOn}</TableCell>
                <TableCell>{profile.rangeModifier}</TableCell>
                {hasPenetration && <TableCell align="right">{profile.armourPenetration ?? '-'}</TableCell>}
                {hasSuppression && <TableCell align="right">{profile.suppressionModifier ?? '-'}</TableCell>}
                {hasCharacteristics && (
                  <TableCell>
                    {profile.characteristics?.length ? (
                      <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                        {profile.characteristics.map((characteristic) => (
                          <Chip key={characteristic} label={characteristic} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                )}
              </TableRow>
            ));
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function UnitList({ units, isOutOfYear, viewMode, onSelect }: Props) {
  const { t } = useTranslation();
  const [expandedUnitIds, setExpandedUnitIds] = useState<Set<string>>(() => new Set());
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

  function toggleWeapons(unitId: string) {
    setExpandedUnitIds((current) => {
      const next = new Set(current);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  }

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
              <TableCell>{t('units.table.actions')}</TableCell>
              <TableCell>{t('common.name')}</TableCell>
              <TableCell>{t('common.faction')}</TableCell>
              <TableCell>{t('units.table.costs')}</TableCell>
              <TableCell align="right">{t('units.detail.resilience')}</TableCell>
              <TableCell align="right">{t('units.detail.recover')}</TableCell>
              <TableCell align="right">{t('units.detail.morale')}</TableCell>
              <TableCell>{t('units.detail.movement.title')}</TableCell>
              <TableCell>{t('units.detail.armour')}</TableCell>
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
                    colSpan={12}
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
                  const assignments = unit.weapons ?? [];
                  const isExpanded = expandedUnitIds.has(unit.id);

                  return (
                    <Fragment key={unit.id}>
                      <TableRow hover sx={{ opacity: outOfYear ? 0.38 : 1 }}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Tooltip title={t('common.view')}>
                            <IconButton size="small" onClick={() => onSelect(unit)} aria-label={t('common.view')}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={isExpanded ? t('units.table.hideWeapons') : t('units.table.showWeapons')}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => toggleWeapons(unit.id)}
                                aria-label={isExpanded ? t('units.table.hideWeapons') : t('units.table.showWeapons')}
                                aria-expanded={isExpanded}
                                disabled={assignments.length === 0}
                              >
                                {isExpanded ? (
                                  <KeyboardArrowUpIcon fontSize="small" />
                                ) : (
                                  <KeyboardArrowDownIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ minWidth: 220 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {unit.name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{t(`factions.${unit.faction}`, unit.faction)}</TableCell>
                        <TableCell sx={{ minWidth: 170 }}>
                          <CostResourcesCell unit={unit} />
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <ProfileValue icon={ShieldIcon} label={t('units.detail.resilience')} value={unit.resilience} />
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <ProfileValue icon={VolunteerActivismIcon} label={t('units.detail.recover')} value={unit.recover} />
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <ProfileValue icon={PsychologyAltIcon} label={t('units.detail.morale')} value={unit.morale} />
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
                      <TableRow>
                        <TableCell colSpan={12} sx={{ py: 0, borderBottom: isExpanded ? undefined : 0 }}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ py: 1.5, px: 2 }}>
                              <Typography variant="subtitle2" sx={{ mb: 1, color: 'secondary.main' }}>
                                {t('units.table.equippedWeapons')}
                              </Typography>
                              {assignments.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                  {t('units.detail.unarmed')}
                                </Typography>
                              ) : (
                                <EquippedWeaponsTable unitId={unit.id} assignments={assignments} />
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </Fragment>
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
