import { Component } from '@angular/core';

@Component({
  selector: 'signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent {
  pseudo: string = '';

  onSignin() {
    console.log('Signin clicked with pseudo:', this.pseudo);

  }
}
