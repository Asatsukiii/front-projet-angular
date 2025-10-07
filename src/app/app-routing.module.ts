import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PlateauComponent } from './plateau/plateau.component';
import { JoueurComponent } from './joueur/joueur.component';
import { ClassementComponent } from './classement/classement.component';

const routes: Routes = [
  // Route par défaut → redirige vers /home
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Pages principales
  { path: 'home', component: HomeComponent },
  { path: 'plateau', component: PlateauComponent },
  { path: 'joueur', component: JoueurComponent },
  { path: 'classement', component: ClassementComponent },

  // Route 404 optionnelle
  { path: '**', redirectTo: '/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
