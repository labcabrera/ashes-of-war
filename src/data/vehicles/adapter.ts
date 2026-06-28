/**
 * Adapts per-file vehicle catalogue entries (src/data/vehicles/<faction>/*.json) into the
 * `VehicleUnit` shape consumed by the existing hooks/components.
 */
import type { ArmorFacingGame, ArmorFacingHistorical, ArmorProfile } from '../../types/catalogue';
import type { ArmorFacing, UnitArmorProfile, VehicleUnit } from '../../types/unit';
import type { VehicleCatalogueEntry } from '../../types/vehicle';

const FACINGS = ['front', 'side', 'rear', 'exposed'] as const;

function requiredNumber(value: number | undefined, unitId: string, field: string): number {
  if (value === undefined) {
    throw new Error(`Vehicle "${unitId}" is missing required ${field}.`);
  }
  return value;
}

function buildTankProfile(
  game: ArmorProfile<ArmorFacingGame>,
  historical: ArmorProfile<ArmorFacingHistorical>,
): UnitArmorProfile {
  return Object.fromEntries(
    FACINGS.map((facing) => {
      const gameFacing = game[facing];
      const historicalFacing = historical[facing];
      const armor: ArmorFacing = {
        value: gameFacing.value,
        armorMM: historicalFacing.thicknessMM,
        armorInclination: historicalFacing.inclinationDeg,
        notes: historicalFacing.notes ?? gameFacing.notes,
      };
      return [facing, armor];
    }),
  ) as unknown as UnitArmorProfile;
}

/** Converts a vehicle catalogue entry into the `VehicleUnit` shape used by `Unit[]` consumers. */
export function vehicleCatalogueEntryToUnit(entry: VehicleCatalogueEntry): VehicleUnit {
  return {
    id: entry.id,
    name: entry.name,
    faction: entry.faction,
    from: entry.from,
    to: entry.to,
    imageUrl: entry.imageUrl,
    type: entry.type,
    cost: entry.game.cost,
    hitPoints: requiredNumber(entry.game.hitPoints, entry.id, 'hitPoints'),
    movement: entry.game.movement,
    resilience: requiredNumber(entry.game.resilience, entry.id, 'resilience'),
    recover: entry.game.recover,
    morale: entry.game.morale,
    overrun: entry.game.overrun,
    casualtiesThreshold: entry.game.casualtiesThreshold,
    resourceCosts: entry.game.resourceCosts,
    weapons: entry.game.weapons,
    keywords: entry.game.keywords,
    armor:
      entry.game.armor && entry.historical.armor
        ? buildTankProfile(entry.game.armor, entry.historical.armor)
        : undefined,
  };
}
