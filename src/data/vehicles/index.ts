/**
 * Aggregates the per-file vehicle catalogue (one JSON file per vehicle, grouped by faction)
 * described in AGENT.md.
 */
import type { VehicleCatalogueEntry } from '../../types/vehicle';

const modules = import.meta.glob<VehicleCatalogueEntry>('./*/*.json', {
  eager: true,
  import: 'default',
});

export const vehicles: VehicleCatalogueEntry[] = Object.values(modules);
