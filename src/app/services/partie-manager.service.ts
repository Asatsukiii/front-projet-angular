import { Injectable } from '@angular/core';
import { PartieService } from './partie.service';
import { JoueurPartieService } from './joueur-partie.service';
import { PionService } from './pion.service';
import { Partie } from '../models/partie.model';
import { Couleur, JoueurPartie } from "../models/joueur-partie.model"
import { forkJoin, switchMap, map, Observable, of } from "rxjs"
import { EtatPion, Pion } from "../models/pion.model"
import { JoueurService } from "./joueur.service"
import { StatistiquesJoueurService } from "./statistiques-joueur.service"
import { CasePlateau } from "../models/case-plateau.model"


@Injectable({ providedIn: "root" })
export class PartieManagerService {
  private classementSorted: { id: number; classement: number }[] | undefined

  constructor(
    private partieService: PartieService,
    private joueurPartieService: JoueurPartieService,
    private pionService: PionService,
    private joueurService: JoueurService,
    private statistiquesJoueurService: StatistiquesJoueurService,
  ) {}

  /**
   * Crée une partie complète avec les joueurs et 1 pion chacun
   * Le pion est positionné sur la case d'écurie correspondant à sa couleur.
   */
  createPartieComplete(pseudos: string[], couleurs: ("ROUGE" | "BLEU" | "VERT" | "JAUNE")[]) {
    const joueurs = pseudos.map((pseudo, i) => ({
      pseudo,
      couleur: couleurs[i],
    }))

    const newPartie: Partie = { etat_partie: "EN_COURS" }

    const caseEcurieMap: Record<"ROUGE" | "BLEU" | "VERT" | "JAUNE", number> = {
      ROUGE: 15,
      JAUNE: 36,
      VERT: 57,
      BLEU: 78,
    }

    return this.partieService.create(newPartie).pipe(
      switchMap((createdPartie) => {
        const jpRequests = joueurs.map((j) =>
          this.joueurService.getJoueurByPseudo(j.pseudo).pipe(
            switchMap((existing) => {
              const joueurIdObs = existing
                ? of(existing.id)
                : this.joueurService.createJoueur(j.pseudo).pipe(map((u) => u.id))

              return joueurIdObs.pipe(
                switchMap((joueurId) => {
                  const jp: Partial<JoueurPartie> = {
                    joueurId,
                    partieId: createdPartie.id_partie!,
                    couleur: j.couleur,
                  }
                  console.log("JoueursPartie créés :", jp)
                  return this.joueurPartieService.create(jp as JoueurPartie)
                }),
              )
            }),
          ),
        )

        return forkJoin(jpRequests).pipe(
          switchMap((joueursPartie) => {
            const pionRequests = joueursPartie.map((jp) => {
              console.log("Création pion pour JoueurPartie :", {
                idJoueurPartie: jp.id,
                couleur: jp.couleur,
                idCasePlateau: caseEcurieMap[jp.couleur as keyof typeof caseEcurieMap],
                etatPion: "ECURIE",
              })

              return this.pionService.create({
                idJoueurPartie: jp.id!,
                idCasePlateau: caseEcurieMap[jp.couleur as keyof typeof caseEcurieMap],
                etatPion: "ECURIE" as EtatPion,
              })
            })

            return forkJoin(pionRequests).pipe(map((pions) => ({ partie: createdPartie, joueursPartie, pions })))
          }),
        )
      }),
    )
  }

  checkVictory(
    partie: Partie,
    joueursPartie: JoueurPartie[],
    pions: Pion[],
    listeCasesSequence: {
      [p: string]: CasePlateau[]
    },
  ) {
    console.log(" checkVictory appelé !")
    console.log("Partie :", partie)
    console.log(
      "Joueurs :",
      joueursPartie.map((j) => ({ pseudo: j.joueur?.pseudo, couleur: j.couleur })),
    )
    console.log(
      "État des pions :",
      pions.map((p) => ({
        couleur: p.joueurPartie?.couleur,
        etatPion: p.etatPion,
        casePlateauID: p.casePlateauID,
      })),
    )

    const gagnant = joueursPartie.find((j) =>
      pions.filter((p) => p.joueurPartie?.id === j.id).every((p) => p.CasePlateau?.position === 21),
    )

    if (gagnant) {
      console.log(" Gagnant détectés :", gagnant.couleur, gagnant.joueur?.pseudo)
      const pionGagnant = pions.find((p) => p.joueurPartie?.id === gagnant.id)
      if (!pionGagnant) {
        console.error("Impossible de trouver le pion du gagnant !")
        return
      }
      const distances = this.calculerClassement(pions, listeCasesSequence)
      this.classementSorted = Object.entries(distances)
        .sort(([, a], [, b]) => a - b)
        .map(([id], idx) => ({ id: +id, classement: idx + 1 }))

      // Mise à jour des JoueurPartie
      this.classementSorted.forEach((c) => {
        const jp = joueursPartie.find((j) => j.id === c.id)
        if (jp) {
          console.log("joueursPartie débug :", jp);
          jp.classement = c.classement
          this.joueurPartieService.updateClassement(jp.id, c.classement).subscribe()
          this.updateStatsJoueur(jp.joueurId, c.classement === 1)
        }
      })

      // Termine la partie
      partie.etat_partie = "TERMINEE"
      this.partieService.updateEtatPartie(partie.id_partie!, "TERMINEE").subscribe()
    } else {
      console.log("Aucun gagnant pour l'instant.")
    }
    console.log("voila le classement trié",this.classementSorted)
    return this.classementSorted
  }

  private isCaseFinale(couleur: "ROUGE" | "BLEU" | "VERT" | "JAUNE", idCase?: number | null): boolean {
    if (!idCase) return false
    const caseFin = { ROUGE: 21, BLEU: 21, VERT: 21, JAUNE: 21 }
    return idCase === caseFin[couleur]
  }

  /**
   * Calcule la distance restante de chaque pion à sa case 21
   */
  private calculerClassement(
    pions: Pion[],
    listeCasesSequence: { [key: string]: CasePlateau[] },
  ): Record<number, number> {
    const distances: Record<number, number> = {}

    pions.forEach((pion) => {
      const couleur = pion.joueurPartie?.couleur
      if (!couleur) {
        console.error("pas de couleurs trouvé pour le pion (classement final)")
        return
      }

      const sequence = listeCasesSequence[couleur]
      if (!sequence || !pion.casePlateauID) {
        console.error("la case trouvé pour le pion n'appartient pas a la sequence  (classement final)")
        return
      }

      const idx = sequence.findIndex((c) => c.idCase === pion.casePlateauID)

      if (pion.etatPion === "ECURIE") {
        distances[pion.joueurPartie!.id] = sequence.length
      } else if (idx >= 0) {
        distances[pion.joueurPartie!.id] = sequence.length - 1 - idx
      } else {
        distances[pion.joueurPartie!.id] = sequence.length
      }
    })

    return distances
  }

  /**
   * Crée ou met à jour les stats du joueur
   */
  private updateStatsJoueur(idJoueur: number, gagne: boolean) {
    this.statistiquesJoueurService.getByJoueurId(idJoueur).subscribe((stat) => {
      if (stat) {
        stat.partiesJouees += 1
        if (gagne) stat.partiesGagnees += 1
        this.statistiquesJoueurService.update(stat.idJoueur!, stat).subscribe()
      } else {
        const newStat = {
          idJoueur,
          partiesJouees: 1,
          partiesGagnees: gagne ? 1 : 0,
        }
        this.statistiquesJoueurService.create(newStat).subscribe()
      }
    })
  }
}
