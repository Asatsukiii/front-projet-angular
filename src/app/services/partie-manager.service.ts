import { Injectable } from '@angular/core';
import { PartieService } from './partie.service';
import { JoueurPartieService } from './joueur-partie.service';
import { PionService } from './pion.service';
import { Partie } from '../models/partie.model';
import { Couleur, JoueurPartie } from "../models/joueur-partie.model"
import { forkJoin, switchMap, map, Observable, of } from "rxjs"
import { EtatPion } from '../models/pion.model';
import { JoueurService } from "./joueur.service"


@Injectable({ providedIn: 'root' })
export class PartieManagerService {
  constructor(
    private partieService: PartieService,
    private joueurPartieService: JoueurPartieService,
    private pionService: PionService,
    private joueurService: JoueurService
  ) {}

  /**
   * Crée une partie complète avec les joueurs et 1 pion chacun
   * Le pion est positionné sur la case d'écurie correspondant à sa couleur.
   */
  createPartieComplete(pseudos: string[], couleurs: ('ROUGE' | 'BLEU' | 'VERT' | 'JAUNE')[]) {
    const joueurs = pseudos.map((pseudo, i) => ({
      pseudo,
      couleur: couleurs[i]
    }));

    const newPartie: Partie = { etat_partie: 'EN_COURS' };

    const caseEcurieMap: Record<'ROUGE' | 'BLEU' | 'VERT' | 'JAUNE', number> = {
      ROUGE: 15, JAUNE: 36, VERT: 57, BLEU: 78
    };

    return this.partieService.create(newPartie).pipe(
      switchMap(createdPartie => {
        const jpRequests = joueurs.map(j =>
          this.joueurService.getJoueurByPseudo(j.pseudo).pipe(
            switchMap(existing => {
              const joueurIdObs = existing
                ? of(existing.id)
                : this.joueurService.createJoueur(j.pseudo).pipe(map(u => u.id));

              return joueurIdObs.pipe(
                switchMap(joueurId => {
                  const jp: Partial<JoueurPartie> = {
                    joueurId,
                    partieId: createdPartie.id_partie!,
                    couleur: j.couleur
                  };
                  console.log('JoueursPartie créés :', jp);
                  return this.joueurPartieService.create(jp as JoueurPartie);
                })
              );
            })
          )
        );

        return forkJoin(jpRequests).pipe(
          switchMap(joueursPartie => {
            const pionRequests = joueursPartie.map(jp => {
              console.log('Création pion pour JoueurPartie :', {
                idJoueurPartie: jp.id,
                couleur: jp.couleur,
                idCasePlateau: caseEcurieMap[jp.couleur as keyof typeof caseEcurieMap],
                etatPion: 'ECURIE'
              });

              return this.pionService.create({
                idJoueurPartie: jp.id!,
                idCasePlateau: caseEcurieMap[jp.couleur as keyof typeof caseEcurieMap],
                etatPion: 'ECURIE' as EtatPion
              });
            });




            return forkJoin(pionRequests).pipe(
              map(pions => ({ partie: createdPartie, joueursPartie, pions }))
            );
          })
        );
      })
    );
  }

}
