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
  //Infos joueur
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
    this.joueurService.getJoueurByPseudo(this.pseudo).subscribe({
      next: (joueur: Joueur) => {
        if (joueur.id !== undefined) {
          this.authService.login(joueur.id, joueur.pseudo);
          this.router.navigate(['/joueur']);
        } else {
          //error si le joueur n'a pas d'ID
          console.error('Joueur ID non défini');
        }
      },
      //Erreur si le joueur n'existe pas
      error: (err) => {
        console.error('Pseudo not found', err);
        alert('Pseudo non trouvé. Merci de vérifier votre pseudo ou de vous inscrire.');
      }
    });
  }
}
