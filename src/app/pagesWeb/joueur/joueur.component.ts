import { Component, OnInit } from '@angular/core';
import { JoueurService } from '../../services/joueur.service';
import { Joueur } from '../../models/joueur.model';
import { Couleur, JoueurPartie } from "../../models/joueur-partie.model";
import { JoueurPartieService } from "../../services/joueur-partie.service";
import { Pion } from "../../models/pion.model";
import { PionService } from "../../services/pion.service";

@Component({
  selector: 'app-joueur',
  templateUrl: './joueur.component.html',
  styleUrls: ['./joueur.component.scss']
})
export class JoueurComponent implements OnInit {

  joueur?: Joueur;
  joueurParties: JoueurPartie[] = [];
  pion: Pion[] = [];
  notLoggedIn: boolean = false; // ✅ New flag

  constructor(
    private joueurService: JoueurService,
    private joueurPartieService: JoueurPartieService,
    private pionService: PionService
  ) {}

  ngOnInit(): void {
    const joueurID = sessionStorage.getItem('joueurID');

    if (joueurID) {
      const id = +joueurID;

      // 🔹 Charger le joueur
      this.joueurService.getJoueurById(id).subscribe({
        next: (joueur) => { this.joueur = joueur; },
        error: (err) => console.error('❌ Erreur chargement joueur:', err)
      });

      // 🔹 Charger les parties associées
      this.joueurPartieService.getByJoueurId(id).subscribe({
        next: (data) => {
          this.joueurParties = data;

          // 🔹 Charger les pions du joueur
          this.pionService.getPionsByJoueur(id).subscribe({
            next: (pions) => { this.pion = pions; },
            error: (err) => console.error('❌ Erreur chargement des pions :', err)
          });
        },
        error: (err) => console.error('❌ Erreur chargement des parties:', err)
      });

    } else {
      // 🔹 If no joueurID in sessionStorage
      console.warn('❌ Aucun joueurID trouvé dans le sessionStorage');
      this.notLoggedIn = true; // ✅ Set the flag
    }
  }

  // 🧠 Méthodes de comptage
  getEnCoursCount(): number {
    return this.joueurParties.filter(jp => jp.partie?.etat_partie === 'EN_COURS').length;
  }

  getPartiesJoueesCount(): number {
    return this.joueurParties.length;
  }

  getPartiesGagneesCount(): number {
    return this.joueurParties.filter(jp => jp.classement === 1).length;
  }

  getTermineesCount(): number {
    return this.joueurParties.filter(jp => jp.partie?.etat_partie === 'TERMINEE').length;
  }
}
