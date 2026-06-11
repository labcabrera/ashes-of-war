/**
 * useUnitData — loads and caches unit data from the static JSON file.
 * Returns filtered units and filter state setters.
 */
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Unit, UnitType, UnitKeyword, UNIT_TYPES } from '../types/unit';
import { allUnits } from '../data/units';
import type { FactionId } from '../types/faction';

export interface NumericRange {
  min: number;
  max: number;
}

interface UnitFilters {
  name: string;
  factions: FactionId[];
  types: UnitType[];
  keywords: UnitKeyword[];
  yearFrom: number;
  yearTo: number;
  costMin: number;
  costMax: number;
}

interface UseUnitDataResult {
  units: Unit[];
  filters: UnitFilters;
  availableFactions: FactionId[];
  availableKeywords: UnitKeyword[];
  yearBounds: NumericRange;
  costBounds: NumericRange;
  typeCounts: Record<UnitType, number>;
  totalCount: number;
  setName: (name: string) => void;
  setFactions: (factions: FactionId[]) => void;
  setTypes: (types: UnitType[]) => void;
  setKeywords: (keywords: UnitKeyword[]) => void;
  setYearRange: (range: [number, number]) => void;
  setCostRange: (range: [number, number]) => void;
  isOutOfYear: (unit: Unit) => boolean;
}

const availableKeywords = [...new Set(allUnits.flatMap((u) => u.keywords ?? []))]
  .filter((kw) => !/^transport-\d+$/.test(kw))
  .sort() as UnitKeyword[];

const availableFactions = [...new Set(allUnits.map((u) => u.faction))].sort() as FactionId[];

const YEAR_BOUNDS: NumericRange = allUnits.reduce(
  (bounds, unit) => ({
    min: Math.min(bounds.min, unit.from),
    max: Math.max(bounds.max, unit.to),
  }),
  { min: Infinity, max: -Infinity },
);

const COST_BOUNDS: NumericRange = allUnits.reduce(
  (bounds, unit) => ({
    min: Math.min(bounds.min, unit.cost),
    max: Math.max(bounds.max, unit.cost),
  }),
  { min: Infinity, max: -Infinity },
);

/** Returns whether a unit matches every filter, optionally ignoring the unit type filter. */
function matchesFilters(unit: Unit, filters: UnitFilters, skipTypes = false): boolean {
  const normalizedName = filters.name.trim().toLocaleLowerCase();
  if (normalizedName && !unit.name.toLocaleLowerCase().includes(normalizedName)) return false;
  if (filters.factions.length > 0 && !filters.factions.includes(unit.faction)) return false;
  if (!skipTypes && filters.types.length > 0 && !filters.types.includes(unit.type)) return false;
  if (filters.keywords.length > 0 && !filters.keywords.some((kw) => unit.keywords?.includes(kw))) return false;
  if (unit.cost < filters.costMin || unit.cost > filters.costMax) return false;
  return true;
}

export function useUnitData(): UseUnitDataResult {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<UnitFilters>({
    name: '',
    factions: [],
    types: [],
    keywords: [],
    yearFrom: YEAR_BOUNDS.min,
    yearTo: YEAR_BOUNDS.max,
    costMin: COST_BOUNDS.min,
    costMax: COST_BOUNDS.max,
  });

  const setName = (name: string) =>
    setFilters((prev) => ({ ...prev, name }));
  const setFactions = (factions: FactionId[]) =>
    setFilters((prev) => ({ ...prev, factions }));
  const setTypes = (types: UnitType[]) =>
    setFilters((prev) => ({ ...prev, types }));
  const setKeywords = (keywords: UnitKeyword[]) =>
    setFilters((prev) => ({ ...prev, keywords }));
  const setYearRange = ([yearFrom, yearTo]: [number, number]) =>
    setFilters((prev) => ({ ...prev, yearFrom, yearTo }));
  const setCostRange = ([costMin, costMax]: [number, number]) =>
    setFilters((prev) => ({ ...prev, costMin, costMax }));

  const isOutOfYear = (unit: Unit): boolean =>
    unit.to < filters.yearFrom || unit.from > filters.yearTo;

  const units = useMemo(() => {
    return allUnits
      .filter((unit) => matchesFilters(unit, filters))
      .sort((a, b) => {
        const typeA = t(`units.types.${a.type}`);
        const typeB = t(`units.types.${b.type}`);
        const typeCmp = typeA.localeCompare(typeB);
        return typeCmp !== 0 ? typeCmp : a.name.localeCompare(b.name);
      });
  }, [filters, t]);

  const { typeCounts, totalCount } = useMemo(() => {
    const matching = allUnits.filter((unit) => matchesFilters(unit, filters, true));
    const counts = Object.fromEntries(UNIT_TYPES.map((type) => [type, 0])) as Record<UnitType, number>;
    for (const unit of matching) counts[unit.type] += 1;
    return { typeCounts: counts, totalCount: matching.length };
  }, [filters]);

  return {
    units,
    filters,
    availableFactions,
    availableKeywords,
    yearBounds: YEAR_BOUNDS,
    costBounds: COST_BOUNDS,
    typeCounts,
    totalCount,
    setName,
    setFactions,
    setTypes,
    setKeywords,
    setYearRange,
    setCostRange,
    isOutOfYear,
  };
}
