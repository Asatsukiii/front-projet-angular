import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  links = [
    { name: 'Accueil', href: '/home' },
    { name: 'Plateau', href: '/plateau' },
    { name: 'Joueur', href: '/joueur' },
    { name: 'Classement', href: '/classement' }
  ];

  authLinks = [
    { name: 'Login', href: '/login' },
    { name: 'Sign in', href: '/signin' }
  ];
}
