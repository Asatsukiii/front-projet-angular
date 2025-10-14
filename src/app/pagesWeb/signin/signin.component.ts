import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { JoueurService } from '../../services/joueur.service';
import { Joueur } from '../../models/joueur.model';

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
      alert('Please enter a pseudo.');
      return;
    }

    this.joueurService.createJoueurWithPseudo(this.pseudo).subscribe({
      next: (joueur: Joueur) => {
        console.log('Joueur created:', joueur);

        // ✅ Use correct field name 'id_joueur'
        if (joueur.id !== undefined) {
          sessionStorage.setItem('joueurID', joueur.id.toString());

          // Navigate to Joueur page
          this.router.navigate(['/joueur']);
        } else {
          console.error('Joueur ID is undefined');
          alert('Unable to create pseudo. Please choose another one.');
        }
      },
      error: (err) => {
        console.error('Failed to create joueur:', err);
        alert('Unable to create pseudo. Please choose another one.');
      }
    });
  }
}
