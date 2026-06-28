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
import type { Unit, UnitArmorProfile, UnitKeyword, UnitWeapon } from '../../types/unit';

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
  organizationThreshold?: number;
  resilience?: number;
  recover?: number;
  morale?: number;
  overrun?: number;
  resourceCosts?: Record<string, number>;
  keywords?: UnitKeyword[];
  weapons?: UnitWeapon[];
  combatants?: number;
  members?: number;
  casualtiesThreshold?: number;
  profile?: UnitArmorProfile;
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
    resilience: requiredNumber(unit.resilience ?? unit.organizationThreshold, unit.id, 'resilience'),
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
      members: requiredNumber(unit.members ?? unit.combatants, unit.id, 'members'),
      casualtiesThreshold: requiredNumber(unit.casualtiesThreshold, unit.id, 'casualtiesThreshold'),
    };
  }

  return {
    ...base,
    type: unit.type,
    casualtiesThreshold: unit.casualtiesThreshold,
    overrun: unit.overrun,
    armor: unit.armor ?? unit.profile,
  };
}
