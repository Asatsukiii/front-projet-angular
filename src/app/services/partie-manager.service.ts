import { Injectable } from '@angular/core';
import { PartieService } from './partie.service';
import { JoueurPartieService } from './joueur-partie.service';
import { PionService } from './pion.service';
import { Partie } from '../models/partie.model';
import { Couleur, JoueurPartie } from "../models/joueur-partie.model";
import { forkJoin, switchMap, map, Observable, of, catchError, tap } from "rxjs";
import { EtatPion, Pion } from "../models/pion.model";
import { JoueurService } from "./joueur.service";
import { StatistiquesJoueurService } from "./statistiques-joueur.service";
import { CasePlateau } from "../models/case-plateau.model";

@Injectable({ providedIn: "root" })
export class PartieManagerService {
  private classementSorted: { id: number; classement: number }[] | undefined;

  constructor(
    private partieService: PartieService,
    private joueurPartieService: JoueurPartieService,
    private pionService: PionService,
    private joueurService: JoueurService,
    private statistiquesJoueurService: StatistiquesJoueurService,
  ) {}

  /**
   * Crée une partie complète avec les joueurs et 1 pion chacun.
   * Process:
   *  1) Vérifie quels pseudos existent déjà
   *  2) Crée uniquement ceux qui manquent
   *  3) Crée la partie, les JoueurPartie et les pions
   * Retourne aussi la liste des pseudos créés.
   */
  createPartieComplete(
    pseudos: string[],
    couleurs: ("ROUGE" | "BLEU" | "VERT" | "JAUNE")[]
  ): Observable<{ partie: Partie; joueursPartie: JoueurPartie[]; pions: Pion[]; createdPlayers: string[] }> {

    const createdPlayers: string[] = [];

    // verifie si les joeueur existe (getJoueurByPseudo devrait retourner 404 ou null s'ils ne sont pas trouvés)
    const checkRequests = pseudos.map(pseudo =>
      this.joueurService.getJoueurByPseudo(pseudo).pipe(
        catchError(() => of(null))
      )
    );

    return forkJoin(checkRequests).pipe(
      // créé en base uniquement les joueurs non existants
      switchMap((existingResults) => {
        const creationRequests = existingResults.map((existing, index) => {
          if (existing) {
            return of(existing);
          }
          return this.joueurService.createJoueur(pseudos[index]).pipe(
            tap(() => createdPlayers.push(pseudos[index]))
          );
        });

        return forkJoin(creationRequests);
      }),

      // Une fois que tous les joueurs existe, on créé la partie, et les joueursPartie and pions associés
      switchMap((finalJoueurs) => {
        const newPartie: Partie = { etat_partie: "EN_COURS" };

        return this.partieService.create(newPartie).pipe(
          switchMap((createdPartie) => {

            const jpRequests = finalJoueurs.map((j: any, i: number) => {
              const jpPayload: Partial<JoueurPartie> = {
                joueurId: j.id,
                partieId: createdPartie.id_partie!,
                couleur: couleurs[i]
              };
              return this.joueurPartieService.create(jpPayload as JoueurPartie).pipe(
                switchMap((createdJp) =>
                  this.joueurService.getJoueurById(createdJp.joueurId!).pipe(
                    map(joueur => ({ ...createdJp, joueur }))
                  )
                )
              );
            });

            return forkJoin(jpRequests).pipe(
              switchMap((joueursPartieAvecJoueur) => {
                const caseEcurieMap = {
                  ROUGE: 15,
                  JAUNE: 36,
                  VERT: 57,
                  BLEU: 78,
                } as const;

                const pionRequests = joueursPartieAvecJoueur.map((jp: any) => {
                  if (jp.id === undefined || jp.id === null) {
                    throw new Error(`JoueurPartie ID is undefined for couleur ${jp.couleur}`);
                  }

                  return this.pionService.create({
                    idJoueurPartie: jp.id,
                    idCasePlateau: caseEcurieMap[jp.couleur as keyof typeof caseEcurieMap],
                    etatPion: "ECURIE" as EtatPion,
                  });
                });

                return forkJoin(pionRequests).pipe(
                  map((pions) => ({
                    partie: createdPartie,
                    joueursPartie: joueursPartieAvecJoueur,
                    pions,
                    createdPlayers,
                  }))
                );
              })
            );
          })
        );
      })
    );
  }

  // fonction de gestion de la victoire. une fois qu'un des joueurs arrive en haut de l'échelle, cette fonction est appelée.
  // On trouve d'abord le gagnant en fonction de son emplacement: il est sur la position 21 de sa couleur.
  // On update le classement pour chacun de nos joueurs parties et on passe le statut partie à: terminé.
  checkVictory(
    partie: Partie,
    joueursPartie: JoueurPartie[],
    pions: Pion[],
    listeCasesSequence: { [p: string]: CasePlateau[] }
  ) {
    console.log("checkVictory appelé !");
    console.log(
      "Joueurs :",
      joueursPartie.map((j) => ({ pseudo: j.joueur?.pseudo, couleur: j.couleur }))
    );

    const gagnant = joueursPartie.find((j) =>
      pions.filter((p) => p.joueurPartie?.id === j.id).every((p) => p.CasePlateau?.position === 21)
    );

    if (gagnant) {
      console.log("Gagnant détecté :", gagnant.couleur, gagnant.joueur?.pseudo);
      const distances = this.calculerClassement(pions, listeCasesSequence);
      this.classementSorted = Object.entries(distances)
        .sort(([, a], [, b]) => a - b)
        .map(([id], idx) => ({ id: +id, classement: idx + 1 }));

      this.classementSorted.forEach((c) => {
        const jp = joueursPartie.find((j) => j.id === c.id);
        if (jp) {
          jp.classement = c.classement;
          this.joueurPartieService.updateClassement(jp.id, c.classement).subscribe();
          this.updateStatsJoueur(jp.joueurId, c.classement === 1);
        }
      });

      partie.etat_partie = "TERMINEE";
      if (partie.id_partie) {
        this.partieService.updateEtatPartie(partie.id_partie, "TERMINEE").subscribe();
      }
    } else {
      console.log("Aucun gagnant pour l'instant.");
    }

    return this.classementSorted;
  }

  // cette fonction nous permet de mettre en place le classement en fonction de la distance séparant le pion de la case arrivée
  // elle se base sur les séquences de case par couleurs définies dans plateau components
  private calculerClassement(
    pions: Pion[],
    listeCasesSequence: { [key: string]: CasePlateau[] }
  ): Record<number, number> {
    const distances: Record<number, number> = {};

    pions.forEach((pion) => {
      const couleur = pion.joueurPartie?.couleur;
      if (!couleur) return;

      const sequence = listeCasesSequence[couleur];
      if (!sequence || !pion.casePlateauID) return;

      const idx = sequence.findIndex((c) => c.idCase === pion.casePlateauID);

      if (pion.etatPion === "ECURIE") {
        distances[pion.joueurPartie!.id] = sequence.length;
      } else if (idx >= 0) {
        distances[pion.joueurPartie!.id] = sequence.length - 1 - idx;
      } else {
        distances[pion.joueurPartie!.id] = sequence.length;
      }
    });

    return distances;
  }

  // cette fonction nous permet de mettre a jour les statistiques de chaque joueur.
  // pour le joueur gagnant : il fait + 1 dans parties réalisées et parties gagnées
  // pour les autres: il rajoute 1 dans les parties réalisées
  private updateStatsJoueur(idJoueur: number, gagne: boolean) {
    this.statistiquesJoueurService.getByJoueurId(idJoueur).subscribe((stat) => {
      if (stat) {
        stat.partiesJouees += 1;
        if (gagne) stat.partiesGagnees += 1;
        this.statistiquesJoueurService.update(stat.idJoueur!, stat).subscribe();
      } else {
        const newStat = {
          idJoueur,
          partiesJouees: 1,
          partiesGagnees: gagne ? 1 : 0,
        };
        this.statistiquesJoueurService.create(newStat).subscribe();
      }
    });
  }
}
