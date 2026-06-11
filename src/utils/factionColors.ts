import type { FactionId } from '../types/faction';

const FACTION_COLORS: Record<FactionId, string> = {
  german: '#5b7a9d',
  'soviet-union': '#a8403a',
  'united-states': '#5a7a4a',
  'united-kingdom': '#a08a5a',
  france: '#6a8caf',
  italy: '#7a8a5a',
  japan: '#9a3a3a',
  finland: '#8a93a0',
  romania: '#a07830',
  china: '#c4a23a',
};

const DEFAULT_FACTION_COLOR = '#7a7568';

export function factionColor(faction: FactionId): string {
  return FACTION_COLORS[faction] ?? DEFAULT_FACTION_COLOR;
}
