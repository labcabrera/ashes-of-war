/**
 * useUnitData — loads and caches unit data from the static JSON file.
 * Returns filtered units and filter state setters.
 */
import { useMemo, useState } from 'react';
import { Unit, UnitType } from '../types/unit';
import unitsData from '../data/units/units.json';
import type { FactionId } from '../types/faction';

interface UnitFilters {
  name: string;
  factions: FactionId[];
  types: UnitType[];
  year: number | '';
}

interface UseUnitDataResult {
  units: Unit[];
  filters: UnitFilters;
  setName: (name: string) => void;
  setFaction: (faction: FactionId | '') => void;
  setTypes: (types: UnitType[]) => void;
  setYear: (year: number | '') => void;
  isOutOfYear: (unit: Unit) => boolean;
}

const allUnits = [...(unitsData.units as unknown as Unit[])].sort((first, second) =>
  first.name.localeCompare(second.name),
);

export function useUnitData(): UseUnitDataResult {
  const [filters, setFilters] = useState<UnitFilters>({
    name: '',
    factions: [],
    types: [],
    year: '',
  });

  const setName = (name: string) =>
    setFilters((prev) => ({ ...prev, name }));
  const setFaction = (faction: FactionId | '') =>
    setFilters((prev) => ({ ...prev, factions: faction ? [faction] : [] }));
  const setTypes = (types: UnitType[]) =>
    setFilters((prev) => ({ ...prev, types }));
  const setYear = (year: number | '') =>
    setFilters((prev) => ({ ...prev, year }));

  const isOutOfYear = (unit: Unit): boolean => {
    if (filters.year === '') return false;
    return unit.from > filters.year || unit.to < filters.year;
  };

  const units = useMemo(() => {
    const normalizedName = filters.name.trim().toLocaleLowerCase();

    return allUnits.filter((unit) => {
      if (normalizedName && !unit.name.toLocaleLowerCase().includes(normalizedName)) return false;
      if (filters.factions.length > 0 && !filters.factions.includes(unit.faction)) return false;
      if (filters.types.length > 0 && !filters.types.includes(unit.type)) return false;
      return true;
    });
  }, [filters.name, filters.factions, filters.types]);

  return { units, filters, setName, setFaction, setTypes, setYear, isOutOfYear };
}
