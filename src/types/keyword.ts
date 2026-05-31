/** All valid rule keyword tags that can be assigned to unit roster entries. */
export type UnitKeyword =
  | 'air-support'
  | 'anti-air'
  | 'explosives'
  | 'half-track'
  | 'low-reliability'
  | 'medic'
  | 'open-topped'
  | 'radio'
  | 'indirect-fire'
  | 'reconnaissance'
  | 'sniper'
  | `transport-${number}`;
