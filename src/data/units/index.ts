/**
 * Shared `Unit[]` catalogue combining the legacy bundled units with the per-file vehicle
 * and towed weapon catalogues (src/data/vehicles/<faction>/*.json and
 * src/data/towed/<faction>/*.json) described in AGENT.md.
 */
import unitsData from './units.json';
import { vehicles } from '../vehicles';
import { towedWeapons } from '../towed';
import { vehicleCatalogueEntryToUnit } from '../vehicles/adapter';
import type { MovementProfile } from '../../types/catalogue';
import type { CheckValue, Unit, UnitArmorProfile, UnitKeyword, UnitWeapon } from '../../types/unit';

export const allUnits: Unit[] = [
  ...(unitsData.units as LegacyUnit[]).map(legacyUnitToUnit),
  ...vehicles.map(vehicleCatalogueEntryToUnit),
  ...towedWeapons.map(vehicleCatalogueEntryToUnit),
];

type LegacyUnit = {
  id: string;
  name: string;
  faction: Unit['faction'];
  type: Unit['type'];
  from: number;
  to: number;
  imageUrl?: string;
  cost: number;
  movement: MovementProfile;
  resilience?: number;
  recover?: CheckValue;
  morale?: CheckValue;
  overrun?: number;
  resourceCosts?: Record<string, number>;
  keywords?: UnitKeyword[];
  weapons?: UnitWeapon[];
  members?: number;
  casualtiesThreshold?: number;
  armor?: UnitArmorProfile;
};

function requiredNumber(value: number | undefined, unitId: string, field: string): number {
  if (value === undefined) {
    throw new Error(`Unit "${unitId}" is missing required ${field}.`);
  }
  return value;
}

function legacyUnitToUnit(unit: LegacyUnit): Unit {
  const base = {
    id: unit.id,
    name: unit.name,
    faction: unit.faction,
    from: unit.from,
    to: unit.to,
    imageUrl: unit.imageUrl,
    type: unit.type,
    cost: unit.cost,
    movement: unit.movement,
    resilience: requiredNumber(unit.resilience, unit.id, 'resilience'),
    recover: unit.recover,
    morale: unit.morale,
    resourceCosts: unit.resourceCosts,
    weapons: unit.weapons,
    keywords: unit.keywords,
  };

  if (unit.type === 'infantry') {
    return {
      ...base,
      type: 'infantry',
      members: requiredNumber(unit.members, unit.id, 'members'),
      casualtiesThreshold: requiredNumber(unit.casualtiesThreshold, unit.id, 'casualtiesThreshold'),
    };
  }

  return {
    ...base,
    type: unit.type,
    casualtiesThreshold: unit.casualtiesThreshold,
    overrun: unit.overrun,
    armor: unit.armor,
  };
}
