import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { JoueurService } from "../../services/joueur.service";
import { Joueur } from "../../models/joueur.model";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  pseudo: string = '';

  constructor(private joueurService: JoueurService, private router: Router) {}

  onLogin() {
    this.joueurService.getJoueurByPseudo(this.pseudo).subscribe({
      next: (joueur: Joueur) => {
        console.log('Login successful:', joueur);

        // Save joueurID in session storage (value comes from joueur.id)
        if (joueur.id !== undefined) {
          sessionStorage.setItem('joueurID', joueur.id.toString());
          this.router.navigate(['/joueur']);
        } else {
          console.error('Joueur ID is undefined');
        }
      },
      error: (err) => {
        console.error('Pseudo not found', err);
        alert('Pseudo not found. Please check your pseudo or register.');
      }
    });
  }
}
