/**
 * useCompanyData loads and filters the static company catalogue.
 */
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { allCompanies } from '../data/companies';
import type { CompanyType } from '../types/company';
import type { FactionId } from '../types/faction';

interface CompanyFilters {
  name: string;
  factions: FactionId[];
}

export interface UseCompanyDataResult {
  companies: CompanyType[];
  filters: CompanyFilters;
  availableFactions: FactionId[];
  factionCounts: Record<FactionId, number>;
  totalCount: number;
  setName: (name: string) => void;
  setFactions: (factions: FactionId[]) => void;
}

const availableFactions = [...new Set(allCompanies.map((company) => company.faction))].sort() as FactionId[];

function matchesFilters(company: CompanyType, filters: CompanyFilters) {
  const normalizedName = filters.name.trim().toLocaleLowerCase();
  if (normalizedName && !company.name.toLocaleLowerCase().includes(normalizedName)) return false;
  if (filters.factions.length > 0 && !filters.factions.includes(company.faction)) return false;
  return true;
}

export function useCompanyData(): UseCompanyDataResult {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<CompanyFilters>({
    name: '',
    factions: [],
  });

  const companies = useMemo(
    () => allCompanies
      .filter((company) => matchesFilters(company, filters))
      .sort((a, b) => {
        const factionCmp = t(`factions.${a.faction}`).localeCompare(t(`factions.${b.faction}`));
        return factionCmp !== 0 ? factionCmp : a.name.localeCompare(b.name);
      }),
    [filters, t],
  );

  const factionCounts = useMemo(() => {
    const counts = Object.fromEntries(availableFactions.map((faction) => [faction, 0])) as Record<FactionId, number>;
    for (const company of allCompanies) counts[company.faction] += 1;
    return counts;
  }, []);

  return {
    companies,
    filters,
    availableFactions,
    factionCounts,
    totalCount: allCompanies.length,
    setName: (name) => setFilters((prev) => ({ ...prev, name })),
    setFactions: (factions) => setFilters((prev) => ({ ...prev, factions })),
  };
}
