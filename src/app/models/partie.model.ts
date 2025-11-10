//modèle partie, on a besoin des status au cas où quelqu'un veut mettre une partie en pause

export type EtatPartie = 'EN_ATTENTE' | 'EN_COURS' | 'TERMINEE';

export interface Partie {
  id_partie?: number;
  date_creation?: Date;
  etat_partie: EtatPartie;
}
