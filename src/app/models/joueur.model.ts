import {Partie} from "./partie.model";
import {Pion} from "./pion.model";

export interface Joueur {
  id?: number;
  pseudo: string;
  partiesJouees: number;
  partiesGagnees: number;
  parties?: Partie[];
  pions?: Pion[];
}

