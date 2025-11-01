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
    // Already logged in
    if (this.alreadyLoggedIn) {
      alert(`You are already connected as ${this.connectedPseudo}. Please logout first to create a new account.`);
      return;
    }

    // Empty pseudo
    if (!this.pseudo.trim()) {
      alert('Please enter a pseudo to create an account.');
      return;
    }

    this.joueurService.createJoueur(this.pseudo).subscribe({
      next: (joueur: Joueur) => {
        if (joueur.id !== undefined) {
          // Login automatically after creation
          this.authService.login(joueur.id, joueur.pseudo);
          alert(`Account created successfully! Welcome, ${joueur.pseudo}.`);
          this.router.navigate(['/joueur']);
        }
      },
      error: (err) => {
        // Handle both 409 (conflict) and 500 (existing pseudo fallback)
        if (err.status === 409 || err.status === 500) {
          alert('You already have an account with this pseudo. Please login instead.');
        } else {
          console.error('Error creating account:', err);
          alert('Failed to create account. Please try again later.');
        }
      }
    });
  }

  onLogout() {
    this.authService.logout();
    alert('You have been logged out.');
  }
}
