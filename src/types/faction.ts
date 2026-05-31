export type FactionId =
  | 'german'
  | 'soviet'
  | 'united-states'
  | 'united-kingdom'
  | 'france'
  | 'italy'
  | 'japan'
  | 'finland'
  | 'romania'
  | 'china';

export interface Faction {
  id: FactionId;
  label: string;
}
