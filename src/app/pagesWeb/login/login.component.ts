import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JoueurService } from '../../services/joueur.service';
import { Joueur } from '../../models/joueur.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  pseudo: string = '';
  alreadyLoggedIn: boolean = false;
  connectedPseudo: string | null = null;

  constructor(
    private joueurService: JoueurService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(status => (this.alreadyLoggedIn = status));
    this.authService.pseudo$.subscribe(pseudo => (this.connectedPseudo = pseudo));
  }

  onLogin() {
    if (this.alreadyLoggedIn) {
      alert('You are already connected. Please logout first.');
      return;
    }

    this.joueurService.getJoueurByPseudo(this.pseudo).subscribe({
      next: (joueur: Joueur) => {
        if (joueur.id !== undefined) {
          this.authService.login(joueur.id, joueur.pseudo);
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

  onLogout() {
    this.authService.logout();
  }
}
