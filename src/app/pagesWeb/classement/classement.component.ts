import { Component } from '@angular/core';

interface JoueurClassement {
  position: number;
  pseudo: string;
  partiesJouees: number;
  partiesGagnees: number;
  tauxVictoire: number;
}

@Component({
  selector: 'classement',
  templateUrl: './classement.component.html',
  styleUrls: ['./classement.component.scss']
})
export class ClassementComponent {

  joueurs: JoueurClassement[] = [
    { position: 1, pseudo: 'Diana', partiesJouees: 10, partiesGagnees: 5, tauxVictoire: 50 },
    { position: 2, pseudo: 'Alice', partiesJouees: 5, partiesGagnees: 2, tauxVictoire: 40 },
    { position: 3, pseudo: 'Bob', partiesJouees: 8, partiesGagnees: 3, tauxVictoire: 37.5 },
    { position: 4, pseudo: 'Charlie', partiesJouees: 2, partiesGagnees: 0, tauxVictoire: 0 }
  ];
}
