import { Component, OnInit } from '@angular/core';
import { JoueurService } from '../../services/joueur.service';
import { Joueur } from '../../models/joueur.model';

interface Partie {
  id: number;
  etat: string;
  couleur: string;
  classement?: number;
}

interface Pion {
  position: string;
  couleur: string;
  etat: string;
}

interface Joueur {
  pseudo: string;
  partiesJouees: number;
  partiesGagnees: number;
  parties: Partie[];
  pions: Pion[];
}

@Component({
  selector: 'app-joueur',
  templateUrl: './joueur.component.html',
  styleUrls: ['./joueur.component.scss']  // corrected
  styleUrls: ['./joueur.component.scss']
})
export class JoueurComponent implements OnInit {
  joueur: Joueur | undefined;

  constructor(private joueurService: JoueurService) {}
export class JoueurComponent {
  joueur: Joueur = {
    pseudo: 'Alice',
    partiesJouees: 5,
    partiesGagnees: 2,
    parties: [
      { id: 1, etat: 'EN_ATTENTE', couleur: 'ROUGE' },
      { id: 2, etat: 'EN_COURS', couleur: 'ROUGE' },
      { id: 3, etat: 'TERMINEE', couleur: 'ROUGE', classement: 2 }
    ],
    pions: [
      { position: 'Case 2', couleur: 'ROUGE', etat: 'EN_JEU' },
      { position: 'Case 3', couleur: 'ROUGE', etat: 'EN_JEU' }
    ]
  };

  ngOnInit() {
    // Retrieve joueurID from session storage
    const joueurID = sessionStorage.getItem('joueurID');

    if (joueurID) {
      this.joueurService.getJoueurById(+joueurID).subscribe({
        next: (joueur) => {
          this.joueur = joueur;
        },
        error: (err) => console.error('Failed to load joueur:', err)
      });
    } else {
      console.error('No joueurID found in session storage');
    }
  }
  getEnCoursCount(): number {
    return this.joueur.parties.filter(p => p.etat === 'EN_COURS').length;
  }

  getTermineesCount(): number {
    return this.joueur.parties.filter(p => p.etat === 'TERMINEE').length;
  }
}
