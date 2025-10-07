export type TypeCase = 'NORMALE' | 'DEPART' | 'ARRIVEE' | 'ECURIE';

export interface CasePlateau {
  id_case?: number;
  position: number;
  type: TypeCase;
}
