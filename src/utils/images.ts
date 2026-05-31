import type { FactionId } from '../types/faction';

export function factionFlagUrl(faction: FactionId) {
  return `/images/factions/${faction}.jpg`;
}

export function unitImageUrl(faction: FactionId, unitId: string) {
  return `/images/units/${faction}/${unitId}.jpg`;
}

export function weaponFactionId(weaponId: string): FactionId | undefined {
  if (weaponId.startsWith('german-')) return 'german';
  if (weaponId.startsWith('soviet-union-') || weaponId.startsWith('su-')) return 'soviet-union';
  return undefined;
}

export function weaponImageUrl(weaponId: string) {
  const faction = weaponFactionId(weaponId);
  const extension = weaponId === 'german-kwk-30-l55' ? 'png' : 'jpg';
  return faction ? `/images/weapons/${faction}/${weaponId}.${extension}` : undefined;
}
