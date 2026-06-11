/**
 * Shared `Unit[]` catalogue combining the legacy bundled units with the per-file vehicle
 * and towed weapon catalogues (src/data/vehicles/<faction>/*.json and
 * src/data/towed/<faction>/*.json) described in AGENT.md.
 */
import unitsData from './units.json';
import { vehicles } from '../vehicles';
import { towedWeapons } from '../towed';
import { vehicleCatalogueEntryToUnit } from '../vehicles/adapter';
import type { Unit } from '../../types/unit';

export const allUnits: Unit[] = [
  ...(unitsData.units as unknown as Unit[]),
  ...vehicles.map(vehicleCatalogueEntryToUnit),
  ...towedWeapons.map(vehicleCatalogueEntryToUnit),
];
