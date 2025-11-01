import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  private pseudo = new BehaviorSubject<string | null>(null);

  isLoggedIn$ = this.loggedIn.asObservable();
  pseudo$ = this.pseudo.asObservable();

  constructor() {
    // Initialize state from existing session
    const joueurID = sessionStorage.getItem('joueurID');
    const joueurPseudo = sessionStorage.getItem('joueurPseudo');

    if (joueurID && joueurPseudo) {
      this.loggedIn.next(true);
      this.pseudo.next(joueurPseudo);
    }
  }

  login(id: number, pseudo: string): void {
    sessionStorage.setItem('joueurID', id.toString());
    sessionStorage.setItem('joueurPseudo', pseudo);
    this.loggedIn.next(true);
    this.pseudo.next(pseudo);
  }

  logout(): void {
    sessionStorage.removeItem('joueurID');
    sessionStorage.removeItem('joueurPseudo');
    this.loggedIn.next(false);
    this.pseudo.next(null);
  }
}
