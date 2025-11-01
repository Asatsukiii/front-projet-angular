import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JoueurService } from '../../services/joueur.service';
import { Joueur } from '../../models/joueur.model';
import { AuthService } from "../../services/auth.service"

@Component({
  selector: 'signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
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
    if (this.alreadyLoggedIn) {
      alert('You are already connected. Please logout first.');
      return;
    }

    if (!this.pseudo.trim()) {
      alert('Veuillez entrer un pseudo');
      return;
    }

    this.joueurService.createJoueur(this.pseudo).subscribe({
      next: (joueur: Joueur) => {
        if (joueur.id !== undefined) {
          // ✅ Use AuthService for session
          this.authService.login(joueur.id, joueur.pseudo);
          this.router.navigate(['/joueur']);
        }
      },
      error: (err) => {
        console.error('Erreur création joueur', err);
        alert('Impossible de créer le joueur.');
      }
    });
  }

  onLogout() {
    this.authService.logout();
  }
}
