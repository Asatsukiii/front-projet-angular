import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Par défaut, l'utilisateur n'est pas connecté
  private loggedIn = new BehaviorSubject<boolean>(false);

  // Stocke le pseudo de l'utilisateur, null tant que personne n'est connecté
  private pseudo = new BehaviorSubject<string | null>(null);

  isLoggedIn$ = this.loggedIn.asObservable();
  pseudo$ = this.pseudo.asObservable();

  constructor() {
    // Vérifie si des informations de session existent
    // Cela permet de conserver l'état de connexion lors du rafraîchissement de la page
    const joueurID = sessionStorage.getItem('joueurID');
    const joueurPseudo = sessionStorage.getItem('joueurPseudo');

    // Si les deux informations sont présentes, on restaure l'état de connexion
    if (joueurID && joueurPseudo) {
      this.loggedIn.next(true);
      this.pseudo.next(joueurPseudo);
    }
  }

  // Méthode pour connecter l'utilisateur
  login(id: number, pseudo: string): void {
    // Sauvegarde de la session
    sessionStorage.setItem('joueurID', id.toString());
    sessionStorage.setItem('joueurPseudo', pseudo);

    // Mise à jour de l'état
    this.loggedIn.next(true);
    this.pseudo.next(pseudo);
  }

  // Méthode pour déconnecter l'utilisateur
  logout(): void {
    // Suppression des données de session
    sessionStorage.removeItem('joueurID');
    sessionStorage.removeItem('joueurPseudo');

    // Mise à jour de l'état
    this.loggedIn.next(false);
    this.pseudo.next(null);
  }
}
