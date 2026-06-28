import { describe, expect, it } from 'vitest';
import {
  armorPenetrationToGameValue,
  armorToGameValue,
  effectiveArmorThicknessMM,
  hitProbabilityToHitOn,
  speedKmhToGameMovement,
  speedKmhToGameInches,
  updateGameDataFromHistorical,
} from '../../src/utils/conversions';
import type { VehicleCatalogueEntry } from '../../src/types/vehicle';

describe('speedKmhToGameInches', () => {
  it('matches the bundled Panzer IV cruise and dash movement values', () => {
    expect(speedKmhToGameInches(40, 'cruise')).toBe(32);
    expect(speedKmhToGameInches(40, 'dash')).toBe(40);
  });

  it('scales tactical pace down from road speed', () => {
    expect(speedKmhToGameInches(40, 'tactical')).toBe(18);
  });

  it('rounds to the nearest whole inch', () => {
    expect(speedKmhToGameInches(38, 'cruise')).toBe(30);
  });
});

describe('speedKmhToGameMovement', () => {
  it('derives road, cross-country, and rough movement from historical road speed', () => {
    expect(speedKmhToGameMovement(40)).toEqual({
      tactical: { road: 18, crossCountry: 14, rough: 7 },
      cruise: { road: 32, crossCountry: 24, rough: 12 },
      dash: { road: 40, crossCountry: 30, rough: 15 },
    });
  });
});

describe('effectiveArmorThicknessMM', () => {
  it('returns the rounded game value for a vertical plate', () => {
    expect(effectiveArmorThicknessMM(80, 0)).toBe(8);
  });

  it('increases the effective thickness as inclination increases', () => {
    expect(effectiveArmorThicknessMM(80, 60)).toBe(16);
  });
});

describe('armorToGameValue', () => {
  it('matches the bundled Panzer IV front armour game scale for an unsloped plate', () => {
    expect(armorToGameValue(80, 0)).toBe(8);
  });

  it('rounds the sloped game armour value to the nearest integer', () => {
    expect(armorToGameValue(80, 10)).toBe(8);
  });
});

describe('armorPenetrationToGameValue', () => {
  it('divides the historical penetration (mm) by 10 and rounds to the nearest integer', () => {
    expect(armorPenetrationToGameValue(132)).toBe(13);
    expect(armorPenetrationToGameValue(99)).toBe(10);
    expect(armorPenetrationToGameValue(91)).toBe(9);
  });
});

describe('hitProbabilityToHitOn', () => {
  it('maps a 100% hit probability to the best ballistic value (2+)', () => {
    expect(hitProbabilityToHitOn(100)).toBe(2);
  });

  it('maps a 50% hit probability to the middle ballistic value (4+)', () => {
    expect(hitProbabilityToHitOn(50)).toBe(4);
  });

  it('maps a low hit probability to the worst ballistic value (6+)', () => {
    expect(hitProbabilityToHitOn(19)).toBe(6);
  });

  it('matches the bundled KwK 36 PzGr.39 combat hit probabilities by range', () => {
    expect(hitProbabilityToHitOn(100)).toBe(2);
    expect(hitProbabilityToHitOn(93)).toBe(2);
    expect(hitProbabilityToHitOn(74)).toBe(3);
    expect(hitProbabilityToHitOn(50)).toBe(4);
    expect(hitProbabilityToHitOn(31)).toBe(5);
    expect(hitProbabilityToHitOn(19)).toBe(6);
  });
});

describe('updateGameDataFromHistorical', () => {
  it('updates derived movement and armour while preserving manually balanced fields', () => {
    const entry: VehicleCatalogueEntry = {
      id: 'test-vehicle',
      name: 'Test Vehicle',
      type: 'tank',
      faction: 'german',
      from: 1944,
      to: 1945,
      reviewedAt: '2026-06-11',
      historical: {
        speedKmh: { road: 40, offRoad: 16, sustainedMarch: 24 },
        armor: {
          front: { thicknessMM: 80, inclinationDeg: 10 },
          side: { thicknessMM: 30, inclinationDeg: 0 },
          rear: { thicknessMM: 20, inclinationDeg: 0 },
          exposed: { thicknessMM: 10, inclinationDeg: 0 },
        },
      },
      game: {
        cost: 32,
        resilience: 10,
        recover: '3+',
        morale: '4+',
        movement: {
          tactical: { road: 1, crossCountry: 1, rough: 1 },
          cruise: { road: 1, crossCountry: 1, rough: 1 },
          dash: { road: 1, crossCountry: 1, rough: 1 },
        },
        armor: {
          front: { value: 1, notes: 'manual weak spot' },
          side: { value: 1 },
          rear: { value: 1 },
          exposed: { value: 1 },
        },
        resourceCosts: { fuel: 8 },
        weapons: [{ id: 'german-kwk-40-l48', count: 1, type: 'turret' }],
        keywords: ['radio'],
      },
    };

    const updated = updateGameDataFromHistorical(entry);

    expect(updated.game.movement).toEqual(speedKmhToGameMovement(40));
    expect(updated.game.armor?.front).toEqual({ value: 8, notes: 'manual weak spot' });
    expect(updated.game.cost).toBe(32);
    expect(updated.game.resourceCosts).toEqual({ fuel: 8 });
    expect(updated.game.weapons).toEqual([{ id: 'german-kwk-40-l48', count: 1, type: 'turret' }]);
    expect(updated.game.keywords).toEqual(['radio']);
  });
});
