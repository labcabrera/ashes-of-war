/**
 * Company catalogue domain types.
 * A company type defines which unit categories may appear in each command role.
 */
import type { FactionId } from './faction';
import type { UnitType } from './unit';

export type CompanySlotRole = 'captain' | 'section' | 'squad' | 'support';

export interface CompanyUnitRule {
  id: string;
  role: CompanySlotRole;
  label: string;
  unitType: UnitType;
  min: number;
  max: number;
}

export interface CompanyType {
  id: string;
  name: string;
  faction: FactionId;
  classification: UnitType;
  description: string;
  rules: CompanyUnitRule[];
}
