/**
 * Validates every per-file vehicle catalogue entry (src/data/vehicles/<faction>/*.json)
 * against its historical/game data shape and weapon links.
 */
import { describe, expect, it } from 'vitest';
import { vehicles } from '../../src/data/vehicles';
import { weaponCatalogueEntries } from '../../src/data/weapons';
import { UNIT_TYPES, type UnitType, type UnitWeaponMountType } from '../../src/types/unit';
import type { FactionId } from '../../src/types/faction';

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

const VEHICLE_TYPES = new Set<UnitType>(UNIT_TYPES.filter((type) => type !== 'infantry'));
const ARMOURED_TYPES = new Set<UnitType>(['tank', 'tank-destroyer', 'assault-gun', 'sp-artillery', 'sp-anti-aircraft']);
const WEAPON_MOUNTS = new Set<UnitWeaponMountType>(['normal', 'turret', 'coaxial', 'hull']);
const REVIEWED_AT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

function isD6CheckTarget(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 6;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function collectWeaponIds(): Set<string> {
  return new Set(weaponCatalogueEntries.map((weapon) => weapon.id));
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
  if (value.imageUrl !== undefined && !isNonEmptyString(value.imageUrl)) {
    errors.push(`${path}.imageUrl must be a non-empty string when provided.`);
  }
  return errors;
}

function validateSpeedKmh(value: unknown, path: string): string[] {
  if (value === undefined) {
    return [];
  }
  if (!isRecord(value)) {
    return [`${path} must be an object.`];
  }

  return ['road', 'offRoad', 'sustainedMarch'].flatMap((field) =>
    isNonNegativeNumber(value[field]) ? [] : [`${path}.${field} must be a non-negative number.`],
  );
}

function validateArmorProfile(
  value: unknown,
  path: string,
  validateFacing: (facing: unknown, facingPath: string) => string[],
): string[] {
  if (!isRecord(value)) {
    return [`${path} must be an object.`];
  }

  return ['front', 'side', 'rear', 'exposed'].flatMap((facing) => validateFacing(value[facing], `${path}.${facing}`));
}

function validateArmorFacingHistorical(value: unknown, path: string): string[] {
  if (!isRecord(value)) {
    return [`${path} must be an object.`];
  }

  const errors: string[] = [];
  if (!isNonNegativeNumber(value.thicknessMM)) {
    errors.push(`${path}.thicknessMM must be a non-negative number.`);
  }
  if (typeof value.inclinationDeg !== 'number' || !Number.isFinite(value.inclinationDeg)) {
    errors.push(`${path}.inclinationDeg must be a finite number.`);
  }
  if (value.notes !== undefined && !isNonEmptyString(value.notes)) {
    errors.push(`${path}.notes must be a non-empty string when provided.`);
  }
  return errors;
}

function validateArmorFacingGame(value: unknown, path: string): string[] {
  if (!isRecord(value)) {
    return [`${path} must be an object.`];
  }

  const errors: string[] = [];
  if (!isNonNegativeInteger(value.value)) {
    errors.push(`${path}.value must be a non-negative integer.`);
  }
  if (value.notes !== undefined && !isNonEmptyString(value.notes)) {
    errors.push(`${path}.notes must be a non-empty string when provided.`);
  }
  return errors;
}

function validateMovement(value: unknown, path: string): string[] {
  if (!isRecord(value)) {
    return [`${path} must be an object.`];
  }

  return ['tactical', 'cruise', 'dash'].flatMap((pace) => {
    const pacePath = `${path}.${pace}`;
    const paceValue = value[pace];
    if (!isRecord(paceValue)) {
      return [`${pacePath} must be an object.`];
    }

    return ['road', 'crossCountry', 'rough'].flatMap((terrain) =>
      isNonNegativeNumber(paceValue[terrain]) ? [] : [`${pacePath}.${terrain} must be a non-negative number.`],
    );
  });
}

function validateWeaponAssignments(value: unknown, path: string, weaponIds: ReadonlySet<string>): string[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    return [`${path} must be an array.`];
  }

  return value.flatMap((assignment, index) => {
    const assignmentPath = `${path}[${index}]`;
    if (!isRecord(assignment)) {
      return [`${assignmentPath} must be an object.`];
    }

    const errors: string[] = [];
    if (!isNonEmptyString(assignment.id)) {
      errors.push(`${assignmentPath}.id must be a non-empty string.`);
    } else if (!weaponIds.has(assignment.id)) {
      errors.push(`${assignmentPath}.id references unknown weapon "${assignment.id}".`);
    }
    if (!isPositiveInteger(assignment.count)) {
      errors.push(`${assignmentPath}.count must be a positive integer.`);
    }
    if (typeof assignment.type !== 'string' || !WEAPON_MOUNTS.has(assignment.type as UnitWeaponMountType)) {
      errors.push(`${assignmentPath}.type must be a supported weapon mount.`);
    }
    return errors;
  });
}

function validateVehicle(value: unknown, index: number, weaponIds: ReadonlySet<string>): string[] {
  const path = `vehicles[${index}]`;
  if (!isRecord(value)) {
    return [`${path} must be an object.`];
  }

  const errors = validateMeta(value, path);
  if (typeof value.type !== 'string' || !VEHICLE_TYPES.has(value.type as UnitType)) {
    errors.push(`${path}.type must be a supported vehicle type.`);
  }
  const isArmoured = typeof value.type === 'string' && ARMOURED_TYPES.has(value.type as UnitType);

  if (!isRecord(value.historical)) {
    errors.push(`${path}.historical must be an object.`);
  } else {
    if (value.historical.notes !== undefined) {
      errors.push(`${path}.historical.notes is deprecated; use i18n descriptions instead.`);
    }
    errors.push(...validateSpeedKmh(value.historical.speedKmh, `${path}.historical.speedKmh`));
    if (isArmoured || value.historical.armor !== undefined) {
      errors.push(...validateArmorProfile(value.historical.armor, `${path}.historical.armor`, validateArmorFacingHistorical));
    }
  }

  if (!isRecord(value.game)) {
    errors.push(`${path}.game must be an object.`);
  } else {
    if (!isNonNegativeInteger(value.game.cost)) {
      errors.push(`${path}.game.cost must be a non-negative integer.`);
    }
    if (!isPositiveInteger(value.game.resilience)) {
      errors.push(`${path}.game.resilience must be a positive integer.`);
    }
    if (!isD6CheckTarget(value.game.recover)) {
      errors.push(`${path}.game.recover must be a numeric D6 check target.`);
    }
    if (!isD6CheckTarget(value.game.morale)) {
      errors.push(`${path}.game.morale must be a numeric D6 check target.`);
    }
    if (value.game.organizationThreshold !== undefined) {
      errors.push(`${path}.game.organizationThreshold is no longer supported; use resilience.`);
    }
    errors.push(...validateMovement(value.game.movement, `${path}.game.movement`));
    if (isArmoured || value.game.armor !== undefined) {
      errors.push(...validateArmorProfile(value.game.armor, `${path}.game.armor`, validateArmorFacingGame));
    }
    if (value.game.resourceCosts !== undefined) {
      if (!isRecord(value.game.resourceCosts)) {
        errors.push(`${path}.game.resourceCosts must be an object.`);
      } else {
        for (const [resource, cost] of Object.entries(value.game.resourceCosts)) {
          if (!isPositiveInteger(cost)) {
            errors.push(`${path}.game.resourceCosts.${resource} must be a positive integer.`);
          }
        }
      }
    }
    errors.push(...validateWeaponAssignments(value.game.weapons, `${path}.game.weapons`, weaponIds));
  }

  return errors;
}

describe('vehicle catalogue validation', () => {
  it('validates every bundled vehicle entry and aggregates errors in its failure report', () => {
    const weaponIds = collectWeaponIds();
    const errors = vehicles.flatMap((vehicle, index) => validateVehicle(vehicle, index, weaponIds));

    if (errors.length > 0) {
      throw new Error(`Vehicle catalogue validation failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
    }
    expect(errors).toEqual([]);
  });

  it('loads the migrated Panzer IV Ausf. G entry with historical and game data', () => {
    const panzerIV = vehicles.find((vehicle) => vehicle.id === 'german-panzer-iv-g');

    expect(panzerIV).toBeDefined();
    expect(panzerIV?.type).toBe('tank');
    expect(panzerIV?.historical.speedKmh.road).toBe(38);
    expect(panzerIV?.game.armor?.front.value).toBe(8);
    expect(panzerIV?.game.weapons?.[0]).toEqual({ id: 'german-kwk-40-l48', count: 1, type: 'turret' });
  });

  it('reports multiple errors for an invalid entry', () => {
    const invalidVehicle = {
      id: '',
      name: 'Broken Vehicle',
      faction: 'atlantis',
      type: 'tank',
      from: 1945,
      to: 1940,
      reviewedAt: 'yesterday',
      historical: {
        notes: 'Use i18n descriptions.',
        speedKmh: { road: -1, offRoad: 10, sustainedMarch: 5 },
      },
      game: {
        cost: -1,
        resilience: 0,
        recover: 7,
        morale: 0,
        movement: {
          tactical: { road: 1, crossCountry: 1, rough: 1 },
          cruise: { road: 1, crossCountry: 1, rough: 1 },
          dash: { road: 1, crossCountry: 1, rough: 1 },
        },
        weapons: [{ id: 'missing-weapon', count: 0, type: 'normal' }],
      },
    };

    const errors = validateVehicle(invalidVehicle, 0, collectWeaponIds());
    expect(errors).toEqual(
      expect.arrayContaining([
        'vehicles[0].id must be a non-empty string.',
        'vehicles[0].faction must be a supported faction id.',
        'vehicles[0].from must be less than or equal to vehicles[0].to.',
        'vehicles[0].reviewedAt must be an ISO date (YYYY-MM-DD).',
        'vehicles[0].historical.notes is deprecated; use i18n descriptions instead.',
        'vehicles[0].historical.speedKmh.road must be a non-negative number.',
        'vehicles[0].historical.armor must be an object.',
        'vehicles[0].game.cost must be a non-negative integer.',
        'vehicles[0].game.resilience must be a positive integer.',
        'vehicles[0].game.recover must be a numeric D6 check target.',
        'vehicles[0].game.morale must be a numeric D6 check target.',
        'vehicles[0].game.armor must be an object.',
        'vehicles[0].game.weapons[0].id references unknown weapon "missing-weapon".',
        'vehicles[0].game.weapons[0].count must be a positive integer.',
      ]),
    );
  });
});
