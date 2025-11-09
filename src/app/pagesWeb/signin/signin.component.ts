import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JoueurService } from '../../services/joueur.service';
import { Joueur } from '../../models/joueur.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  //Infos joueur
  pseudo: string = '';
  alreadyLoggedIn: boolean = false;
  connectedPseudo: string | null = null;

  constructor(
    private joueurService: JoueurService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(status => (this.alreadyLoggedIn = status));
    this.authService.pseudo$.subscribe(pseudo => (this.connectedPseudo = pseudo));
  }

  onSignin() {
    this.joueurService.createJoueur(this.pseudo).subscribe({
      next: (joueur: Joueur) => {
        if (joueur.id !== undefined) {
          // Connexion automatique après création du compte, envois sur la page joueur
          this.authService.login(joueur.id, joueur.pseudo);
          alert(`Account created successfully! Welcome, ${joueur.pseudo}.`);
          this.router.navigate(['/joueur']);
        }
      },
      error: (err) => {
        //Erreur pseudo existe déjà, si l'on devais sécuriser l'interface le message le message ne serais pas si clair
        if (err.status === 409 || err.status === 500) {
          alert('Ce compte existe déjà. Connectez-vous.');
        } else {
          console.error("Error creating account:", err)
          alert("Erreure lors de la création du compte. Réassayez-plus tard.")
        }
      }
    });
  }
}
