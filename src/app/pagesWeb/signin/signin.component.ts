import { Component } from '@angular/core';
import { JoueurService } from "../../services/joueur.service";
import { Joueur } from "../../models/joueur.model";
import { Router } from "@angular/router"
@Component({
  selector: 'signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent {
  pseudo: string = '';

  constructor(private joueurService: JoueurService, private router: Router) {}

  onSignin() {
    if (!this.pseudo.trim()) {
      alert('Veuillez entrer un pseudo');
      return;
    }

    this.joueurService.createJoueur(this.pseudo).subscribe({
      next: (joueur: Joueur) => {
        console.log('Joueur créé avec succès:', joueur);
        if (joueur.id !== undefined) {
          sessionStorage.setItem('joueurID', joueur.id.toString());
          this.router.navigate(['/joueur']);
        }
      },
      error: (err) => {
        console.error('Erreur création joueur', err);
        alert('Impossible de créer le joueur.');
      }
    });
  }


}
