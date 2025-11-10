//modèle joueur, on a besoin des infos des parties et des pions qui lui sont reliés
import {Partie} from "./partie.model";
import {Pion} from "./pion.model";

export interface Joueur {
  id?: number;
  pseudo: string;
  partiesJouees: number;
  partiesGagnees: number;

  //Relations avec les autres tables
  parties?: Partie[];
  pions?: Pion[];
}

