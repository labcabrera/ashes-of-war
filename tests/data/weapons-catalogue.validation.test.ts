/**
 * Validates every per-file weapon catalogue entry (src/data/weapons/<faction>/*.json)
 * against its historical/game data shape and firing profiles.
 */
import { describe, expect, it } from 'vitest';
import { weaponCatalogueEntries } from '../../src/data/weapons';
import type { FactionId } from '../../src/types/faction';
import type { WeaponType } from '../../src/types/weapon';

type UnknownRecord = Record<string, unknown>;

const FACTION_IDS = new Set<FactionId>([
  'german',
  'soviet-union',
  'united-states',
  'united-kingdom',
  'france',
  'italy',
  'japan',
  'finland',
  'romania',
  'china',
]);

const WEAPON_TYPES = new Set<WeaponType>(['soft', 'hard', 'artillery', 'anti-aircraft']);
const REVIEWED_AT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const RANGE_MODIFIER_PATTERN = /^\d+\/\d+\/-\d+$/;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function validateMeta(value: UnknownRecord, path: string): string[] {
  const errors: string[] = [];
  for (const field of ['id', 'name']) {
    if (!isNonEmptyString(value[field])) {
      errors.push(`${path}.${field} must be a non-empty string.`);
    }
  }
  if (typeof value.faction !== 'string' || !FACTION_IDS.has(value.faction as FactionId)) {
    errors.push(`${path}.faction must be a supported faction id.`);
  }
  if (!Number.isInteger(value.from) || !Number.isInteger(value.to)) {
    errors.push(`${path}.from and ${path}.to must be integer years.`);
  } else if (Number(value.from) > Number(value.to)) {
    errors.push(`${path}.from must be less than or equal to ${path}.to.`);
  }
  if (typeof value.reviewedAt !== 'string' || !REVIEWED_AT_PATTERN.test(value.reviewedAt)) {
    errors.push(`${path}.reviewedAt must be an ISO date (YYYY-MM-DD).`);
  }
  return errors;
}

function validateRateRange(value: unknown, path: string): string[] {
  if (!isRecord(value)) {
    return [`${path} must be an object.`];
  }

  const errors: string[] = [];
  if (!Number.isInteger(value.min)) {
    errors.push(`${path}.min must be an integer.`);
  }
  if (!Number.isInteger(value.max)) {
    errors.push(`${path}.max must be an integer.`);
  }
  if (Number.isInteger(value.min) && Number.isInteger(value.max) && Number(value.min) > Number(value.max)) {
    errors.push(`${path}.min must be less than or equal to ${path}.max.`);
  }
  return errors;
}

function validatePenetrationTable(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) {
    return [`${path} must be an array when provided.`];
  }

  const errors: string[] = [];
  value.forEach((row, index) => {
    const rowPath = `${path}[${index}]`;
    if (!isRecord(row)) {
      errors.push(`${rowPath} must be an object.`);
      return;
    }
    if (!isPositiveInteger(row.rangeM)) {
      errors.push(`${rowPath}.rangeM must be a positive integer.`);
    }
    if (row.penetrationMM !== undefined && !isNonNegativeInteger(row.penetrationMM)) {
      errors.push(`${rowPath}.penetrationMM must be a non-negative integer when provided.`);
    }
    for (const field of ['hitProbabilityTraining', 'hitProbabilityCombat']) {
      const probability = row[field];
      if (probability !== undefined && (!Number.isInteger(probability) || Number(probability) < 0 || Number(probability) > 100)) {
        errors.push(`${rowPath}.${field} must be an integer between 0 and 100 when provided.`);
      }
    }
  });
  return errors;
}

function validateAmmunition(value: unknown, path: string): string[] {
  if (!isRecord(value)) {
    return [`${path} must be an object when provided.`];
  }

  const errors: string[] = [];
  for (const [ammunitionId, ammunition] of Object.entries(value)) {
    const ammunitionPath = `${path}.${ammunitionId}`;
    if (!isRecord(ammunition)) {
      errors.push(`${ammunitionPath} must be an object.`);
      continue;
    }
    if (ammunition.name !== undefined && !isNonEmptyString(ammunition.name)) {
      errors.push(`${ammunitionPath}.name must be a non-empty string when provided.`);
    }
    if (ammunition.description !== undefined && !isNonEmptyString(ammunition.description)) {
      errors.push(`${ammunitionPath}.description must be a non-empty string when provided.`);
    }
    if (ammunition.projectileWeightKg !== undefined && !(typeof ammunition.projectileWeightKg === 'number' && ammunition.projectileWeightKg > 0)) {
      errors.push(`${ammunitionPath}.projectileWeightKg must be a positive number when provided.`);
    }
    if (ammunition.explosiveChargeKg !== undefined && !(typeof ammunition.explosiveChargeKg === 'number' && ammunition.explosiveChargeKg >= 0)) {
      errors.push(`${ammunitionPath}.explosiveChargeKg must be a non-negative number when provided.`);
    }
    if (ammunition.penetrationAngleDeg !== undefined && !isNonNegativeInteger(ammunition.penetrationAngleDeg)) {
      errors.push(`${ammunitionPath}.penetrationAngleDeg must be a non-negative integer when provided.`);
    }
    if (ammunition.penetrationTable !== undefined) {
      errors.push(...validatePenetrationTable(ammunition.penetrationTable, `${ammunitionPath}.penetrationTable`));
    }
  }
  return errors;
}

function validateHistorical(value: unknown, path: string): string[] {
  if (!isRecord(value)) {
    return [`${path} must be an object.`];
  }

  const errors: string[] = [];
  if (value.caliberMM !== undefined && !isPositiveInteger(value.caliberMM)) {
    errors.push(`${path}.caliberMM must be a positive integer when provided.`);
  }
  if (value.barrelLength !== undefined && !isNonEmptyString(value.barrelLength)) {
    errors.push(`${path}.barrelLength must be a non-empty string when provided.`);
  }
  if (value.mounting !== undefined) {
    if (!Array.isArray(value.mounting) || !value.mounting.every(isNonEmptyString)) {
      errors.push(`${path}.mounting must be an array of non-empty strings when provided.`);
    }
  }
  if (value.muzzleVelocityMps !== undefined) {
    if (!isRecord(value.muzzleVelocityMps)) {
      errors.push(`${path}.muzzleVelocityMps must be an object when provided.`);
    } else {
      for (const [ammunition, velocity] of Object.entries(value.muzzleVelocityMps)) {
        if (!isPositiveInteger(velocity)) {
          errors.push(`${path}.muzzleVelocityMps.${ammunition} must be a positive integer.`);
        }
      }
    }
  }
  if (value.rateOfFirePerMinute !== undefined) {
    if (!isRecord(value.rateOfFirePerMinute)) {
      errors.push(`${path}.rateOfFirePerMinute must be an object when provided.`);
    } else {
      errors.push(...validateRateRange(value.rateOfFirePerMinute.theoretical, `${path}.rateOfFirePerMinute.theoretical`));
      errors.push(...validateRateRange(value.rateOfFirePerMinute.combat, `${path}.rateOfFirePerMinute.combat`));
    }
  }
  if (value.typicalAmmunition !== undefined) {
    if (!Array.isArray(value.typicalAmmunition) || !value.typicalAmmunition.every(isNonEmptyString)) {
      errors.push(`${path}.typicalAmmunition must be an array of non-empty strings when provided.`);
    }
  }
  if (value.ammunition !== undefined) {
    errors.push(...validateAmmunition(value.ammunition, `${path}.ammunition`));
  }
  if (value.sourceUrl !== undefined && !isNonEmptyString(value.sourceUrl)) {
    errors.push(`${path}.sourceUrl must be a non-empty string when provided.`);
  }
  if (value.notes !== undefined && !isNonEmptyString(value.notes)) {
    errors.push(`${path}.notes must be a non-empty string when provided.`);
  }
  return errors;
}

function validateProfile(value: unknown, path: string, weaponType: WeaponType): string[] {
  if (!isRecord(value)) {
    return [`${path} must be an object.`];
  }

  const errors: string[] = [];
  for (const field of ['id', 'name']) {
    if (!isNonEmptyString(value[field])) {
      errors.push(`${path}.${field} must be a non-empty string.`);
    }
  }
  if (!isPositiveInteger(value.shots)) {
    errors.push(`${path}.shots must be a positive integer.`);
  }
  if (!isPositiveInteger(value.hitOn)) {
    errors.push(`${path}.hitOn must be a positive integer.`);
  }
  if (typeof value.rangeModifier !== 'string' || !RANGE_MODIFIER_PATTERN.test(value.rangeModifier)) {
    errors.push(`${path}.rangeModifier must match the "A/B/-C" notation.`);
  }
  if (weaponType === 'hard' && !isNonNegativeInteger(value.armourPenetration)) {
    errors.push(`${path}.armourPenetration must be a non-negative integer for "hard" weapons.`);
  } else if (value.armourPenetration !== undefined && !isNonNegativeInteger(value.armourPenetration)) {
    errors.push(`${path}.armourPenetration must be a non-negative integer when provided.`);
  }
  if (weaponType === 'soft' && !Number.isInteger(value.suppressionModifier)) {
    errors.push(`${path}.suppressionModifier must be an integer for "soft" weapons.`);
  } else if (value.suppressionModifier !== undefined && !Number.isInteger(value.suppressionModifier)) {
    errors.push(`${path}.suppressionModifier must be an integer when provided.`);
  }
  if (value.characteristics !== undefined) {
    if (!Array.isArray(value.characteristics) || !value.characteristics.every(isNonEmptyString)) {
      errors.push(`${path}.characteristics must be an array of non-empty strings when provided.`);
    }
  }
  return errors;
}

function validateWeapon(value: unknown, index: number): string[] {
  const path = `weapons[${index}]`;
  if (!isRecord(value)) {
    return [`${path} must be an object.`];
  }

  const errors = validateMeta(value, path);
  if (typeof value.type !== 'string' || !WEAPON_TYPES.has(value.type as WeaponType)) {
    errors.push(`${path}.type must be a supported weapon type.`);
    return errors;
  }
  const weaponType = value.type as WeaponType;

  errors.push(...validateHistorical(value.historical, `${path}.historical`));

  if (!isRecord(value.game) || !Array.isArray(value.game.profiles) || value.game.profiles.length === 0) {
    errors.push(`${path}.game.profiles must be a non-empty array.`);
  } else {
    const profileIds = new Set<string>();
    value.game.profiles.forEach((profile, profileIndex) => {
      const profilePath = `${path}.game.profiles[${profileIndex}]`;
      errors.push(...validateProfile(profile, profilePath, weaponType));
      if (isRecord(profile) && isNonEmptyString(profile.id)) {
        if (profileIds.has(profile.id)) {
          errors.push(`${profilePath}.id duplicates profile id "${profile.id}".`);
        }
        profileIds.add(profile.id);
      }
    });
  }

  return errors;
}

describe('weapon catalogue validation', () => {
  it('validates every bundled weapon catalogue entry and aggregates errors in its failure report', () => {
    const errors = weaponCatalogueEntries.flatMap((weapon, index) => validateWeapon(weapon, index));

    if (errors.length > 0) {
      throw new Error(`Weapon catalogue validation failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
    }
    expect(errors).toEqual([]);
  });

  it('loads the migrated 7.5 cm KwK 40 L/48 entry with historical and game data', () => {
    const kwk40 = weaponCatalogueEntries.find((weapon) => weapon.id === 'german-kwk-40-l48');

    expect(kwk40).toBeDefined();
    expect(kwk40?.type).toBe('hard');
    expect(kwk40?.historical.caliberMM).toBe(75);
    expect(kwk40?.historical.muzzleVelocityMps?.apcbc).toBe(750);
    expect(kwk40?.game.profiles[0]).toMatchObject({ id: 'apcbc', armourPenetration: 10 });
  });

  it('loads the 8.8 cm KwK 36 PzGr.39 historical penetration table', () => {
    const kwk36 = weaponCatalogueEntries.find((weapon) => weapon.id === 'german-kwk-36-l56');
    const apcbc = kwk36?.historical.ammunition?.apcbc;

    expect(apcbc).toBeDefined();
    expect(apcbc?.name).toBe('PzGr. 39');
    expect(apcbc?.penetrationAngleDeg).toBe(30);
    expect(apcbc?.penetrationTable).toHaveLength(7);
    expect(apcbc?.penetrationTable?.[0]).toMatchObject({
      rangeM: 100,
      penetrationMM: 132,
      hitProbabilityTraining: 100,
      hitProbabilityCombat: 100,
    });
    expect(apcbc?.penetrationTable?.[5]).toMatchObject({ rangeM: 2500, hitProbabilityCombat: 31 });
  });

  it('reports multiple errors for an invalid entry', () => {
    const invalidWeapon = {
      id: '',
      name: 'Broken Gun',
      faction: 'atlantis',
      type: 'hard',
      from: 1945,
      to: 1940,
      reviewedAt: 'yesterday',
      historical: {
        caliberMM: -1,
      },
      game: {
        profiles: [
          {
            id: 'broken',
            name: 'Broken',
            shots: 0,
            hitOn: 0,
            rangeModifier: 'fast',
          },
        ],
      },
    };

    const errors = validateWeapon(invalidWeapon, 0);
    expect(errors).toEqual(
      expect.arrayContaining([
        'weapons[0].id must be a non-empty string.',
        'weapons[0].faction must be a supported faction id.',
        'weapons[0].from must be less than or equal to weapons[0].to.',
        'weapons[0].reviewedAt must be an ISO date (YYYY-MM-DD).',
        'weapons[0].historical.caliberMM must be a positive integer when provided.',
        'weapons[0].game.profiles[0].shots must be a positive integer.',
        'weapons[0].game.profiles[0].hitOn must be a positive integer.',
        'weapons[0].game.profiles[0].rangeModifier must match the "A/B/-C" notation.',
        'weapons[0].game.profiles[0].armourPenetration must be a non-negative integer for "hard" weapons.',
      ]),
    );
  });
});
