/**
 * Shared `Unit[]` catalogue combining the per-file infantry, vehicle, and towed weapon
 * catalogues described in AGENT.md.
 */
import { infantryUnits } from '../infantry';
import { vehicles } from '../vehicles';
import { towedWeapons } from '../towed';
import { vehicleCatalogueEntryToUnit } from '../vehicles/adapter';
import type { Unit } from '../../types/unit';

export const allUnits: Unit[] = [
  ...infantryUnits,
  ...vehicles.map(vehicleCatalogueEntryToUnit),
  ...towedWeapons.map(vehicleCatalogueEntryToUnit),
];
