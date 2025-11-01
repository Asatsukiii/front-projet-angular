import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from "../services/auth.service"

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  links = [
    { name: 'Accueil', href: '/home' },
    { name: 'Plateau', href: '/plateau' },
    { name: 'Joueur', href: '/joueur' },
    { name: 'Classement', href: '/classement' },
    { name: 'Regles', href: '/regles' }
  ];

  authLinks = [
    { name: 'Login', href: '/login' },
    { name: 'Sign in', href: '/signin' }
  ];

  isLoggedIn: boolean = false;
  connectedPseudo: string | null = null;

  private subscriptions: Subscription[] = [];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Reactively subscribe to auth changes
    this.subscriptions.push(
      this.authService.isLoggedIn$.subscribe(status => (this.isLoggedIn = status)),
      this.authService.pseudo$.subscribe(pseudo => (this.connectedPseudo = pseudo))
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
