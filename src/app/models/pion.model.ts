import { JoueurPartie } from './joueur-partie.model';
import { CasePlateau } from './case-plateau.model';

export type EtatPion = 'ECURIE' | 'EN_JEU' | 'ARRIVE';

export interface Pion {
  id_pion?: number;
  id_joueur_partie: number;
  id_case?: number | null;
  etat: EtatPion;

  // Relations
  joueur_partie?: JoueurPartie;
  case_plateau?: CasePlateau;
}


