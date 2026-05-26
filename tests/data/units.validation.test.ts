/**
 * Validates every static unit catalogue entry against its domain constraints and weapon links.
 */
import { describe, expect, it } from 'vitest';
import unitsData from '../../src/data/units/units.json';
import weaponsData from '../../src/data/weapons/weapons.json';
import type { UnitType, UnitWeaponMountType } from '../../src/types/unit';

type UnknownRecord = Record<string, unknown>;

const UNIT_TYPES = new Set<UnitType>([
  'infantry',
  'tank',
  'tank-destroyer',
  'assault-gun',
  'self-propelled-artillery',
  'motorised',
  'mechanised',
  'reconnaissance',
  'engineer',
  'artillery-towed',
  'sniper',
  'medic',
  'aircraft',
  'special',
]);
const WEAPON_MOUNTS = new Set<UnitWeaponMountType>(['normal', 'turret', 'coaxial', 'hull']);

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

function collectWeaponIds(catalogue: unknown): Set<string> {
  if (!isRecord(catalogue) || !Array.isArray(catalogue.weapons)) {
    return new Set();
  }

  return new Set(
    catalogue.weapons.flatMap((weapon) =>
      isRecord(weapon) && isNonEmptyString(weapon.id) ? [weapon.id] : [],
    ),
  );
}

function validateWeaponAssignments(
  value: unknown,
  path: string,
  weaponIds: ReadonlySet<string>,
  required: boolean,
): string[] {
  if (value === undefined && !required) {
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

function validateTankProfile(value: unknown, path: string): string[] {
  if (!isRecord(value)) {
    return [`${path} must be an object for tank units.`];
  }

  return ['front', 'side', 'rear', 'exposed'].flatMap((field) =>
    isNonNegativeInteger(value[field]) ? [] : [`${path}.${field} must be a non-negative integer.`],
  );
}

function validateMovement(value: unknown, path: string): string[] {
  if (!isRecord(value)) {
    return [`${path} must be an object.`];
  }

  return ['tactical', 'cruise', 'maximum', 'offRoad'].flatMap((field) =>
    typeof value[field] === 'number' && Number.isFinite(value[field]) && Number(value[field]) >= 0
      ? []
      : [`${path}.${field} must be a non-negative number.`],
  );
}

function validateUnit(value: unknown, index: number, weaponIds: ReadonlySet<string>): string[] {
  const path = `units[${index}]`;
  if (!isRecord(value)) {
    return [`${path} must be an object.`];
  }

  const errors: string[] = [];
  for (const field of ['id', 'name', 'faction']) {
    if (!isNonEmptyString(value[field])) {
      errors.push(`${path}.${field} must be a non-empty string.`);
    }
  }
  if (typeof value.type !== 'string' || !UNIT_TYPES.has(value.type as UnitType)) {
    errors.push(`${path}.type must be a supported unit type.`);
  }
  if (!isNonNegativeInteger(value.cost)) {
    errors.push(`${path}.cost must be a non-negative integer.`);
  }
  errors.push(...validateMovement(value.movement, `${path}.movement`));
  if (!Number.isInteger(value.from) || !Number.isInteger(value.to)) {
    errors.push(`${path}.from and ${path}.to must be integer years.`);
  } else if (Number(value.from) > Number(value.to)) {
    errors.push(`${path}.from must be less than or equal to ${path}.to.`);
  }

  if (value.resourceCosts !== undefined) {
    if (!isRecord(value.resourceCosts)) {
      errors.push(`${path}.resourceCosts must be an object.`);
    } else {
      for (const [resource, cost] of Object.entries(value.resourceCosts)) {
        if (!isPositiveInteger(cost)) {
          errors.push(`${path}.resourceCosts.${resource} must be a positive integer.`);
        }
      }
    }
  }
  if (value.imageUrl !== undefined && !isNonEmptyString(value.imageUrl)) {
    errors.push(`${path}.imageUrl must be a non-empty string when provided.`);
  }

  if (value.type === 'tank') {
    errors.push(...validateTankProfile(value.profile, `${path}.profile`));
  }

  if (value.type === 'infantry') {
    if (!Array.isArray(value.bases) || value.bases.length === 0) {
      errors.push(`${path}.bases must contain at least one infantry base.`);
    } else {
      value.bases.forEach((base, baseIndex) => {
        const basePath = `${path}.bases[${baseIndex}]`;
        if (!isRecord(base)) {
          errors.push(`${basePath} must be an object.`);
          return;
        }
        if (!isPositiveInteger(base.members)) {
          errors.push(`${basePath}.members must be a positive integer.`);
        }
        errors.push(...validateWeaponAssignments(base.weapons, `${basePath}.weapons`, weaponIds, true));
      });
    }
    if (value.weapons !== undefined) {
      errors.push(`${path}.weapons must be assigned inside bases for infantry units.`);
    }
  } else {
    if (value.bases !== undefined) {
      errors.push(`${path}.bases is only supported for infantry units.`);
    }
    errors.push(...validateWeaponAssignments(value.weapons, `${path}.weapons`, weaponIds, false));
  }

  return errors;
}

function validateUnitCatalogue(catalogue: unknown, weaponIds: ReadonlySet<string>): string[] {
  if (!isRecord(catalogue)) {
    return ['Unit catalogue must be an object.'];
  }

  const errors: string[] = [];
  if (catalogue._version !== 3) {
    errors.push('Unit catalogue _version must be 3.');
  }
  if (!Array.isArray(catalogue.units)) {
    errors.push('Unit catalogue units must be an array.');
    return errors;
  }

  const ids = new Set<string>();
  catalogue.units.forEach((unit, index) => {
    if (isRecord(unit) && isNonEmptyString(unit.id)) {
      if (ids.has(unit.id)) {
        errors.push(`units[${index}].id duplicates unit id "${unit.id}".`);
      }
      ids.add(unit.id);
    }
    errors.push(...validateUnit(unit, index, weaponIds));
  });
  return errors;
}

describe('static unit catalogue validation', () => {
  it('validates every bundled unit and aggregates errors in its failure report', () => {
    const errors = validateUnitCatalogue(unitsData, collectWeaponIds(weaponsData));

    if (errors.length > 0) {
      throw new Error(`Unit catalogue validation failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
    }
    expect(errors).toEqual([]);
  });

  it('reports multiple model and weapon-reference errors together', () => {
    const invalidCatalogue = {
      _version: 3,
      units: [
        {
          id: 'broken-infantry',
          name: '',
          type: 'infantry',
          faction: 'soviet',
          from: 1945,
          to: 1941,
          cost: 1,
          movement: { tactical: -1, cruise: 2, maximum: 3, offRoad: 1 },
          weapons: [],
          bases: [{ members: 0, weapons: [{ id: 'missing-weapon', count: 0, type: 'normal' }] }],
        },
      ],
    };

    const errors = validateUnitCatalogue(invalidCatalogue, collectWeaponIds(weaponsData));
    expect(errors).toEqual(
      expect.arrayContaining([
        'units[0].name must be a non-empty string.',
        'units[0].movement.tactical must be a non-negative number.',
        'units[0].from must be less than or equal to units[0].to.',
        'units[0].bases[0].members must be a positive integer.',
        'units[0].bases[0].weapons[0].id references unknown weapon "missing-weapon".',
        'units[0].bases[0].weapons[0].count must be a positive integer.',
        'units[0].weapons must be assigned inside bases for infantry units.',
      ]),
    );
  });
});
