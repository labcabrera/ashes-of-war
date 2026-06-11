/**
 * Aggregates the per-file towed weapon catalogue (one JSON file per piece, grouped by faction)
 * described in AGENT.md.
 */
import type { VehicleCatalogueEntry } from '../../types/vehicle';

const modules = import.meta.glob<VehicleCatalogueEntry>('./*/*.json', {
  eager: true,
  import: 'default',
});

export const towedWeapons: VehicleCatalogueEntry[] = Object.values(modules);
