import type { FactionId } from '../types/faction';
import type { UnitType } from '../types/unit';
import type { UnitTypeIconStyle } from '../hooks/useDisplaySettings';

export function factionFlagUrl(faction: FactionId) {
  return `/images/factions/${faction}.jpg`;
}

export function unitImageUrl(faction: FactionId, unitId: string) {
  return `/images/units/${faction}/${unitId}.jpg`;
}

export function unitTypeIconUrl(type: UnitType, style: UnitTypeIconStyle = 'pictogram') {
  return style === 'nato' ? `/images/unit-types/nato/${type}.png` : `/images/unit-types/${type}.png`;
}

export function weaponFactionId(weaponId: string): FactionId | undefined {
  if (weaponId.startsWith('german-')) return 'german';
  if (weaponId.startsWith('soviet-union-')) return 'soviet-union';
  if (weaponId.startsWith('united-states-')) return 'united-states';
  return undefined;
}

export function weaponImageUrl(weaponId: string) {
  const faction = weaponFactionId(weaponId);
  const extension = weaponId === 'german-kwk-30-l55' ? 'png' : 'jpg';
  return faction ? `/images/weapons/${faction}/${weaponId}.${extension}` : undefined;
}
