import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  pseudo: string = '';

  onLogin() {
    console.log('Login clicked with pseudo:', this.pseudo);
    // Here you can call your login API or service
  }
}
