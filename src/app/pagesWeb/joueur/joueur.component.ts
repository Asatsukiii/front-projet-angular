import { Component, OnInit } from '@angular/core';
import { JoueurService } from '../../services/joueur.service';
import { Joueur } from '../../models/joueur.model';
import { Couleur, JoueurPartie } from "../../models/joueur-partie.model";
import { JoueurPartieService } from "../../services/joueur-partie.service";
import { Pion } from "../../models/pion.model";
import { PionService } from "../../services/pion.service";

// la page joueur affiche les informations liées au joueur connecté.
// s'il n'y a aucun joueur connecté, invite l'utilisateur à se connecter en allant sur la page de connexion
// une fois le joueur connecté, son ID et son pseudo est stocké dans le sessionStorage
// il peut donc avoir accès sur la page joueur à l'historique de ses parties, ses statistiques et ses pions

@Component({
  selector: 'app-joueur',
  templateUrl: './joueur.component.html',
  styleUrls: ['./joueur.component.scss']
})
export class JoueurComponent implements OnInit {

  joueur?: Joueur;
  joueurParties: JoueurPartie[] = [];
  pion: Pion[] = [];
  notLoggedIn: boolean = false;

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
        next: (joueur) => {this.joueur = joueur;
        console.log(' Joueur chargé :', joueur);
        },
        error: (err) => console.error(' Erreur chargement joueur:', err)
      });

      // 🔹 Charger les parties associées
      this.joueurPartieService.getByJoueurId(id).subscribe({
        next: (data) => {this.joueurParties = data;
          console.log(' Parties chargé :', data);

          this.pionService.getPionsByJoueur(id).subscribe({
            next: (pions) => {
              this.pion = pions;
              console.log(' Pions chargés :', pions);
            },
            error: (err) => console.error(' Erreur chargement des pions :', err)
          });
        },
        error: (err) => console.error(' Erreur chargement des parties:', err)
      });

    } else {
      console.warn(' Aucun joueurID trouvé dans le sessionStorage');
      this.notLoggedIn = true;
    }
  }



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
