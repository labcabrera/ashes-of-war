/**
 * Adapts per-file weapon catalogue entries (src/data/weapons/<faction>/*.json) into the
 * legacy `Weapon` shape consumed by the existing hooks/components.
 */
import type { Weapon } from '../../types/weapon';
import type { WeaponCatalogueEntry } from '../../types/weapon-catalogue';

/** Converts a weapon catalogue entry into the legacy `Weapon` shape used by `Weapon[]` consumers. */
export function weaponCatalogueEntryToWeapon(entry: WeaponCatalogueEntry): Weapon {
  return {
    id: entry.id,
    name: entry.name,
    type: entry.type,
    rateOfFirePerMinute: entry.historical.rateOfFirePerMinute,
    profiles: entry.game.profiles,
  };
}
