import { Joueur } from './joueur.model';

export interface StatistiquesJoueur {
  id_joueur?: number;
  parties_jouees: number;
  parties_gagnees: number;
  joueur?: Joueur;
}
