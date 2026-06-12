/**
 * Shared company catalogue assembled from per-faction JSON files.
 */
import germanInfantryCompany from './german/infantry-company.json';
import type { CompanyType } from '../../types/company';

export const allCompanies: CompanyType[] = [
  germanInfantryCompany as CompanyType,
];
