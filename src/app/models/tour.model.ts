//modèle d'un tour
import { Partie } from './partie.model';
import { JoueurPartie } from './joueur-partie.model';

export interface Tour {
  id_tour?: number;
  id_partie: number;
  id_joueur_partie: number;
  de_lance: number;
  date_tour?: Date;

  // Relations
  partie?: Partie;
  joueur_partie?: JoueurPartie;
}
