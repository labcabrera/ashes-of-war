/** All valid rule keyword tags that can be assigned to unit roster entries. */
export type UnitKeyword =
  | 'air-support'
  | 'anti-air'
  | 'explosives'
  | 'half-track'
  | 'hq'
  | `hq-${number}`
  | 'independent'
  | 'low-reliability'
  | 'medic'
  | 'open-topped'
  | 'rare'
  | 'radio'
  | 'indirect-fire'
  | 'reconnaissance'
  | `section-command-${number}-${number}`
  | 'sniper'
  | `transport-${number}`;
