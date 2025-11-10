//modèle pion.
//Chaque pion est relié à un joueurPartie qui fait le lien entre le pion, le joueur et la partie
import { JoueurPartie } from './joueur-partie.model';
import { CasePlateau } from './case-plateau.model';

export type EtatPion = 'ECURIE' | 'EN_JEU' | 'ARRIVE';
export type Couleur = 'ROUGE' | 'BLEU' | 'VERT' | 'JAUNE';

export interface Pion {
  idPion?: number;
  idJoueurPartie: number;
  casePlateauID?: number | null;
  etatPion: EtatPion;

  joueurPartie?: {
    id: number;
    couleur: Couleur;
    partie?: {
      id: number;
    };
  };

  //Relations avec les autres tables
  JoueurPartie?: JoueurPartie;
  CasePlateau?: CasePlateau;
}

