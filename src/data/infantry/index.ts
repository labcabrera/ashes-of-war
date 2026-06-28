/**
 * Aggregates the per-file infantry catalogue (one JSON file per unit, grouped by faction).
 */
import type { InfantryUnit } from '../../types/unit';

const modules = import.meta.glob<InfantryUnit>('./*/*.json', {
  eager: true,
  import: 'default',
});

export const infantryUnits: InfantryUnit[] = Object.values(modules);
