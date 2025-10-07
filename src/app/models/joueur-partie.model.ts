import { Partie } from './partie.model';
import { Joueur } from './joueur.model';

export type Couleur = 'ROUGE' | 'BLEU' | 'VERT' | 'JAUNE';

export interface JoueurPartie {
  id_joueur_partie?: number;
  id_partie: number;
  id_joueur: number;
  couleur: Couleur;
  classement?: number | null;

  // Relations possibles
  partie?: Partie;
  joueur?: Joueur;
}
