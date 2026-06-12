/**
 * Verifies conversion and validation of persisted hierarchical army-list schemas.
 */
import { describe, expect, it } from 'vitest';
import { migrateArmiesStore } from '../../src/hooks/migrations/armies';

describe('army storage migrations', () => {
  it('migrates a flat v1 army into a rooted company hierarchy without changing quantities', () => {
    const migrated = migrateArmiesStore({
      _version: 1,
      armies: [{
        id: 'legacy-army',
        name: 'Legacy force',
        armyTypeId: 'de-early-war',
        units: [
          { unitId: 'unit-a', quantity: 2 },
          { unitId: 'unit-b', quantity: 1 },
        ],
        savedAt: '2026-05-25T12:00:00.000Z',
      }],
    });

    expect(migrated._version).toBe(3);
    expect(migrated.armies[0]?.faction).toBe('german');
    expect(migrated.armies[0]?.pointBudget).toBe(1000);
    expect(migrated.armies[0]?.nodes.map((node) => node.kind)).toEqual(['army', 'company', 'unit', 'unit']);
    expect(
      migrated.armies[0]?.nodes.filter((node) => node.kind === 'unit').map((node) => node.quantity),
    ).toEqual([2, 1]);
  });

  it('rejects v2 armies containing cyclic parent relations', () => {
    const migrated = migrateArmiesStore({
      _version: 2,
      armies: [{
        id: 'invalid',
        name: 'Cycle',
        armyTypeId: 'de-early-war',
        savedAt: '2026-05-25T12:00:00.000Z',
        nodes: [
          { id: 'root', kind: 'army', label: 'Cycle', parentId: null, position: { x: 0, y: 0 } },
          { id: 'a', kind: 'company', label: 'A', parentId: 'b', position: { x: 0, y: 0 } },
          { id: 'b', kind: 'platoon', label: 'B', parentId: 'a', position: { x: 0, y: 0 } },
        ],
      }],
    });

    expect(migrated.armies).toEqual([]);
  });
});
