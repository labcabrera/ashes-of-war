/**
 * Weapon catalogue types for ranged combat reference data and firing profiles.
 */

export type WeaponType = 'soft' | 'hard' | 'artillery' | 'anti-aircraft';

export type WeaponFeature = 'supression' | 'overheat' | 'area';

export interface WeaponFeatureModifier {
  feature: WeaponFeature;
  modifier: string | number | null;
}

export interface RateRange {
  min: number;
  max: number;
}

export interface WeaponRateOfFire {
  theoretical: RateRange;
  combat: RateRange;
}

export interface WeaponProfile {
  id: string;
  name: string;
  shots: number;
  hitOn: number;
  rangeModifier: string;
  armourPenetration?: number;
  suppressionModifier?: number;
  characteristics?: string[];
}

export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  rateOfFirePerMinute?: WeaponRateOfFire;
  profiles: WeaponProfile[];
}
