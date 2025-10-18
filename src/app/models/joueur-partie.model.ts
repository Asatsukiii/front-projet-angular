import { Partie } from './partie.model';
import { Joueur } from './joueur.model';
import {Pion} from "./pion.model";

export type Couleur = 'ROUGE' | 'BLEU' | 'VERT' | 'JAUNE';

export interface JoueurPartie {
  id: number;
  id_joueur_partie: number;
  partieId: number;
  joueurId: number;
  couleur: Couleur;
  classement?: number | null;

  // Relations possibles
  partie?: Partie;
  joueur?: Joueur;
  pions?: Pion[];
}
