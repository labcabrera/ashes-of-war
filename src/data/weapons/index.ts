/**
 * Aggregates the per-file weapon catalogue (one JSON file per weapon, grouped by faction)
 * described in AGENT.md.
 */
import { weaponCatalogueEntryToWeapon } from './adapter';
import type { Weapon } from '../../types/weapon';
import type { WeaponCatalogueEntry } from '../../types/weapon-catalogue';

const modules = import.meta.glob<WeaponCatalogueEntry>('./*/*.json', {
  eager: true,
  import: 'default',
});

export const weaponCatalogueEntries: WeaponCatalogueEntry[] = Object.values(modules);

export const allWeapons: Weapon[] = weaponCatalogueEntries.map(weaponCatalogueEntryToWeapon);
