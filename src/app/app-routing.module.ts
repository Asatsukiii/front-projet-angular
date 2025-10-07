import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pagesWeb/home/home.component';
import { PlateauComponent } from './pagesWeb/plateau/plateau.component';
import { JoueurComponent } from './pagesWeb/joueur/joueur.component';
import { ClassementComponent } from './pagesWeb/classement/classement.component';
import { LoginComponent } from './pagesWeb/login/login.component';
import { SigninComponent } from './pagesWeb/signin/signin.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  { path: 'home', component: HomeComponent },
  { path: 'plateau', component: PlateauComponent },
  { path: 'joueur', component: JoueurComponent },
  { path: 'classement', component: ClassementComponent },

  { path: 'login', component: LoginComponent },
  { path: 'signin', component: SigninComponent },

  { path: '**', redirectTo: '/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
