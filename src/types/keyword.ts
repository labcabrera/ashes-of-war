/** All valid rule keyword tags that can be assigned to unit roster entries. */
export type UnitKeyword =
  | 'air-support'
  | 'half-track'
  | 'low-reliability'
  | 'medic'
  | 'open-topped'
  | 'radio'
  | 'reconnaissance'
  | 'sniper'
  | `transport-${number}`;
