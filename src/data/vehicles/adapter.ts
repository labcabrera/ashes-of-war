/**
 * Adapts per-file vehicle catalogue entries (src/data/vehicles/<faction>/*.json) into the
 * legacy `VehicleUnit` shape consumed by the existing hooks/components.
 */
import type { ArmorFacingGame, ArmorFacingHistorical, ArmorProfile } from '../../types/catalogue';
import type { Armor, TankProfile, VehicleUnit } from '../../types/unit';
import type { VehicleCatalogueEntry } from '../../types/vehicle';

const FACINGS = ['front', 'side', 'rear', 'exposed'] as const;

function buildTankProfile(
  game: ArmorProfile<ArmorFacingGame>,
  historical: ArmorProfile<ArmorFacingHistorical>,
): TankProfile {
  return Object.fromEntries(
    FACINGS.map((facing) => {
      const gameFacing = game[facing];
      const historicalFacing = historical[facing];
      const armor: Armor = {
        value: gameFacing.value,
        armorMM: historicalFacing.thicknessMM,
        armorInclination: historicalFacing.inclinationDeg,
        notes: historicalFacing.notes ?? gameFacing.notes,
      };
      return [facing, armor];
    }),
  ) as unknown as TankProfile;
}

/** Converts a vehicle catalogue entry into the legacy `VehicleUnit` shape used by `Unit[]` consumers. */
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
    movement: entry.game.movement,
    organizationThreshold: entry.game.organizationThreshold,
    casualtiesThreshold: entry.game.casualtiesThreshold,
    resourceCosts: entry.game.resourceCosts,
    weapons: entry.game.weapons,
    keywords: entry.game.keywords,
    profile:
      entry.game.armor && entry.historical.armor
        ? buildTankProfile(entry.game.armor, entry.historical.armor)
        : undefined,
  };
}
