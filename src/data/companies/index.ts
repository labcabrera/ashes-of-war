/**
 * Shared company catalogue assembled from per-faction JSON files.
 */
import germanInfantryCompany from './german/infantry-company.json';
import germanPanzergrenadierCompany from './german/panzergrenadier-company.json';
import type { CompanyType } from '../../types/company';

export const allCompanies: CompanyType[] = [
  germanInfantryCompany as CompanyType,
  germanPanzergrenadierCompany as CompanyType,
];
