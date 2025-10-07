import { Component } from '@angular/core';

@Component({
  selector: 'app-plateau',
  templateUrl: './plateau.component.html',
  styleUrls: ['./plateau.component.scss']
})
export class PlateauComponent {
  showRules = false;

  toggleRules() {
    this.showRules = !this.showRules;
  }
}
