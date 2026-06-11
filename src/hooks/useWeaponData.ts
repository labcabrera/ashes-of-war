/**
 * useWeaponData — loads and caches weapon catalogue data from the per-file JSON catalogue.
 * Returns filtered weapons and filter state setters, mirroring useUnitData.
 */
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { weaponCatalogueEntries } from '../data/weapons';
import { WeaponType, WEAPON_TYPES } from '../types/weapon';
import type { WeaponCatalogueEntry } from '../types/weapon-catalogue';
import type { FactionId } from '../types/faction';
import type { NumericRange } from './useUnitData';

interface WeaponFilters {
  name: string;
  factions: FactionId[];
  types: WeaponType[];
  yearFrom: number;
  yearTo: number;
}

interface UseWeaponDataResult {
  weapons: WeaponCatalogueEntry[];
  filters: WeaponFilters;
  availableFactions: FactionId[];
  yearBounds: NumericRange;
  typeCounts: Record<WeaponType, number>;
  totalCount: number;
  setName: (name: string) => void;
  setFactions: (factions: FactionId[]) => void;
  setTypes: (types: WeaponType[]) => void;
  setYearRange: (range: [number, number]) => void;
  isOutOfYear: (weapon: WeaponCatalogueEntry) => boolean;
}

const availableFactions = [...new Set(weaponCatalogueEntries.map((w) => w.faction))].sort() as FactionId[];

const YEAR_BOUNDS: NumericRange = weaponCatalogueEntries.reduce(
  (bounds, weapon) => ({
    min: Math.min(bounds.min, weapon.from),
    max: Math.max(bounds.max, weapon.to),
  }),
  { min: Infinity, max: -Infinity },
);

/** Returns whether a weapon matches every filter, optionally ignoring the weapon type filter. */
function matchesFilters(weapon: WeaponCatalogueEntry, filters: WeaponFilters, skipTypes = false): boolean {
  const normalizedName = filters.name.trim().toLocaleLowerCase();
  if (normalizedName && !weapon.name.toLocaleLowerCase().includes(normalizedName)) return false;
  if (filters.factions.length > 0 && !filters.factions.includes(weapon.faction)) return false;
  if (!skipTypes && filters.types.length > 0 && !filters.types.includes(weapon.type)) return false;
  return true;
}

export function useWeaponData(): UseWeaponDataResult {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<WeaponFilters>({
    name: '',
    factions: [],
    types: [],
    yearFrom: YEAR_BOUNDS.min,
    yearTo: YEAR_BOUNDS.max,
  });

  const setName = (name: string) =>
    setFilters((prev) => ({ ...prev, name }));
  const setFactions = (factions: FactionId[]) =>
    setFilters((prev) => ({ ...prev, factions }));
  const setTypes = (types: WeaponType[]) =>
    setFilters((prev) => ({ ...prev, types }));
  const setYearRange = ([yearFrom, yearTo]: [number, number]) =>
    setFilters((prev) => ({ ...prev, yearFrom, yearTo }));

  const isOutOfYear = (weapon: WeaponCatalogueEntry): boolean =>
    weapon.to < filters.yearFrom || weapon.from > filters.yearTo;

  const weapons = useMemo(() => {
    return weaponCatalogueEntries
      .filter((weapon) => matchesFilters(weapon, filters))
      .sort((a, b) => {
        const typeA = t(`weapons.types.${a.type}`);
        const typeB = t(`weapons.types.${b.type}`);
        const typeCmp = typeA.localeCompare(typeB);
        return typeCmp !== 0 ? typeCmp : a.name.localeCompare(b.name);
      });
  }, [filters, t]);

  const { typeCounts, totalCount } = useMemo(() => {
    const matching = weaponCatalogueEntries.filter((weapon) => matchesFilters(weapon, filters, true));
    const counts = Object.fromEntries(WEAPON_TYPES.map((type) => [type, 0])) as Record<WeaponType, number>;
    for (const weapon of matching) counts[weapon.type] += 1;
    return { typeCounts: counts, totalCount: matching.length };
  }, [filters]);

  return {
    weapons,
    filters,
    availableFactions,
    yearBounds: YEAR_BOUNDS,
    typeCounts,
    totalCount,
    setName,
    setFactions,
    setTypes,
    setYearRange,
    isOutOfYear,
  };
}
