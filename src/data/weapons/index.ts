/**
 * Aggregates the per-file weapon catalogue (one JSON file per weapon, grouped by faction)
 * described in AGENT.md. Coexists with the legacy bundled `weapons.json` catalogue.
 */
import type { WeaponCatalogueEntry } from '../../types/weapon-catalogue';

const modules = import.meta.glob<WeaponCatalogueEntry>('./*/*.json', {
  eager: true,
  import: 'default',
});

export const weaponCatalogueEntries: WeaponCatalogueEntry[] = Object.values(modules);
