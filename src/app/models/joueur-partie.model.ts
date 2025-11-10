//modèle liaison entre joueur et partie
import { Partie } from './partie.model';
import { Joueur } from './joueur.model';
import {Pion} from "./pion.model";

export type Couleur = 'ROUGE' | 'BLEU' | 'VERT' | 'JAUNE';

export interface JoueurPartie {
  id: number;
  joueurId: number;
  partieId: number;
  couleur: Couleur;
  classement?: number | null;

  //Relations avec les autres tables
  partie?: Partie;
  joueur?: Joueur;
  pions?: Pion[];
}
