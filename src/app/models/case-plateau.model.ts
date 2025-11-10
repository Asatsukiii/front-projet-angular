//modèle des cases du plateau, chaque case a une couleur, une position, et un type

export type TypeCase = 'NORMALE' | 'DEPART' | 'ARRIVEE' | 'ECURIE' | 'ECHELLE';
export type CouleurCase = 'ROUGE' | 'BLEU' | 'VERT' | 'JAUNE' | 'AUCUNE';

export interface CasePlateau {
  idCase?: number;
  position: number;
  couleur: CouleurCase;
  typeCase: TypeCase;
}
