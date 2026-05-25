/**
 * useUnitData — loads and caches unit data from the static JSON file.
 * Returns filtered units and filter state setters.
 */
import { useMemo, useState } from 'react';
import { Unit, UnitType } from '../types/unit';
import unitsData from '../data/units/units.json';

interface UnitFilters {
  faction: string;
  type: UnitType | '';
  year: number | '';
}

interface UseUnitDataResult {
  units: Unit[];
  filters: UnitFilters;
  setFilaction: (faction: string) => void;
  setType: (type: UnitType | '') => void;
  setYear: (year: number | '') => void;
  isOutOfYear: (unit: Unit) => boolean;
}

const allUnits = unitsData.units as unknown as Unit[];

export function useUnitData(): UseUnitDataResult {
  const [filters, setFilters] = useState<UnitFilters>({
    faction: '',
    type: '',
    year: '',
  });

  const setFilaction = (faction: string) =>
    setFilters((prev) => ({ ...prev, faction }));
  const setType = (type: UnitType | '') =>
    setFilters((prev) => ({ ...prev, type }));
  const setYear = (year: number | '') =>
    setFilters((prev) => ({ ...prev, year }));

  const isOutOfYear = (unit: Unit): boolean => {
    if (filters.year === '') return false;
    return unit.from > filters.year || unit.to < filters.year;
  };

  const units = useMemo(() => {
    return allUnits.filter((unit) => {
      if (filters.faction && unit.faction !== filters.faction) return false;
      if (filters.type && unit.type !== filters.type) return false;
      return true;
    });
  }, [filters.faction, filters.type]);

  return { units, filters, setFilaction, setType, setYear, isOutOfYear };
}
