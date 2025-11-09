//modèle des cases du plateau, chaque case à une couleur qui correspond aussi à celles des pions
//et une position qui correspond aussi  son type
export type TypeCase = 'NORMALE' | 'DEPART' | 'ARRIVEE' | 'ECURIE' | 'ECHELLE';
export type CouleurCase = 'ROUGE' | 'BLEU' | 'VERT' | 'JAUNE' | 'AUCUNE';

export interface CasePlateau {
  idCase?: number;
  position: number;
  couleur: CouleurCase;
  typeCase: TypeCase;
}
