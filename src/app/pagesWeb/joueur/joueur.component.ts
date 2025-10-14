import { Component, OnInit } from '@angular/core';
import { JoueurService } from '../../services/joueur.service';
import { Joueur } from '../../models/joueur.model';

@Component({
  selector: 'app-joueur',
  templateUrl: './joueur.component.html',
  styleUrls: ['./joueur.component.scss']  // corrected
})
export class JoueurComponent implements OnInit {
  joueur: Joueur | undefined;

  constructor(private joueurService: JoueurService) {}

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
}
