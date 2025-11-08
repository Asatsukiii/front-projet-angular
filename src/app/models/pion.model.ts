import { JoueurPartie } from './joueur-partie.model';
import { CasePlateau } from './case-plateau.model';

export type EtatPion = 'ECURIE' | 'EN_JEU' | 'ARRIVE';
export type Couleur = 'ROUGE' | 'BLEU' | 'VERT' | 'JAUNE';

export interface Pion {
  idPion?: number;
  idJoueurPartie: number;
  casePlateau?: number | null;
  etatPion: EtatPion;
  joueurPartie?: {
    id: number;
    couleur: Couleur;
    partie?: {
      id: number;
    };
  };

  // Relations
  JoueurPartie?: JoueurPartie;
  CasePlateau?: CasePlateau;
}

