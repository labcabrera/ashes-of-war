import { describe, expect, it } from 'vitest';
import {
  armorPenetrationToGameValue,
  armorToGameValue,
  effectiveArmorThicknessMM,
  hitProbabilityToHitOn,
  speedKmhToGameInches,
} from '../../src/utils/conversions';

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

describe('effectiveArmorThicknessMM', () => {
  it('returns the nominal thickness for a vertical (unsloped) plate', () => {
    expect(effectiveArmorThicknessMM(80, 0)).toBe(80);
  });

  it('increases the effective thickness as inclination increases', () => {
    expect(effectiveArmorThicknessMM(80, 60)).toBeCloseTo(160, 5);
  });
});

describe('armorToGameValue', () => {
  it('matches the bundled Panzer IV front armour value for an unsloped plate', () => {
    expect(armorToGameValue(80, 0)).toBe(80);
  });

  it('rounds the sloped effective thickness to the nearest integer', () => {
    expect(armorToGameValue(80, 10)).toBe(81);
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
