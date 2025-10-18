export type EtatPartie = 'EN_ATTENTE' | 'EN_COURS' | 'TERMINEE';

export interface Partie {
  id_partie?: number;
  date_creation?: Date;
  etat_partie: EtatPartie;
}
