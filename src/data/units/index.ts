/**
 * Shared `Unit[]` catalogue combining the legacy bundled units with the per-file vehicle
 * catalogue (src/data/vehicles/<faction>/*.json) described in AGENT.md.
 */
import unitsData from './units.json';
import { vehicles } from '../vehicles';
import { vehicleCatalogueEntryToUnit } from '../vehicles/adapter';
import type { Unit } from '../../types/unit';

export const allUnits: Unit[] = [
  ...(unitsData.units as unknown as Unit[]),
  ...vehicles.map(vehicleCatalogueEntryToUnit),
];
