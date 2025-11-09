//modèle pion
import { JoueurPartie } from './joueur-partie.model';
import { CasePlateau } from './case-plateau.model';

export type EtatPion = 'ECURIE' | 'EN_JEU' | 'ARRIVE';

export interface Pion {
  idPion?: number;
  joueurPartieId: number;
  casePlateau?: number | null;
  etatPion: EtatPion;

  joueurPartie?: {
    id: number;
    couleur: string;
    partie?: {
      id: number;
    };
  };

  // Relations avec les autres tables
  JoueurPartie?: JoueurPartie;
  CasePlateau?: CasePlateau;
}

