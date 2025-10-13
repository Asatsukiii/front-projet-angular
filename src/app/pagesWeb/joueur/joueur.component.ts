import { Component } from '@angular/core';

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
  selector: 'joueur',
  templateUrl: './joueur.component.html',
  styleUrls: ['./joueur.component.scss']
})
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

  getEnCoursCount(): number {
    return this.joueur.parties.filter(p => p.etat === 'EN_COURS').length;
  }

  getTermineesCount(): number {
    return this.joueur.parties.filter(p => p.etat === 'TERMINEE').length;
  }
}
