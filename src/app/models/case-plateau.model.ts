export type TypeCase = 'NORMALE' | 'DEPART' | 'ARRIVEE' | 'ECURIE' | 'ECHELLE';
export type CouleurCase = 'ROUGE' | 'BLEU' | 'VERT' | 'JAUNE' | 'AUCUNE';

export interface CasePlateau {
  id_case?: number;
  position: number;
  couleur: CouleurCase;
  typeCase: TypeCase;
}
