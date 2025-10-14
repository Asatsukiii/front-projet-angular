import { JoueurPartie } from './joueur-partie.model';
import { CasePlateau } from './case-plateau.model';

export type EtatPion = 'ECURIE' | 'EN_JEU' | 'ARRIVE';

export interface Pion {
  id?: number;
  joueurPartie: number;
  casePlateau?: number | null;
  etatPion: EtatPion;

  // Relations
  JoueurPartie?: JoueurPartie;
  CasePlateau?: CasePlateau;
}

