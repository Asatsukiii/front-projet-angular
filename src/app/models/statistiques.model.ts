//modèle statistiques joueurs
import { Joueur } from './joueur.model';

export interface StatistiquesJoueur {
  idJoueur?: number;
  partiesJouees: number;
  partiesGagnees: number;
  joueur?: Joueur;
}
