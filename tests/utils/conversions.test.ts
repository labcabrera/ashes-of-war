import { describe, expect, it } from 'vitest';
import { armorToGameValue, effectiveArmorThicknessMM, speedKmhToGameInches } from '../../src/utils/conversions';

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
