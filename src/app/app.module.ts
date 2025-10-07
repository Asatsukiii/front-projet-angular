import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SigninComponent } from './pagesWeb/signin/signin.component';
import { LoginComponent } from './pagesWeb/login/login.component';
import { HomeComponent } from './pagesWeb/home/home.component';
import { PlateauComponent } from './pagesWeb/plateau/plateau.component';
import { JoueurComponent } from './pagesWeb/joueur/joueur.component';
import { ClassementComponent } from './pagesWeb/classement/classement.component';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from "./navbar/navbar.component"
import { MatListModule } from '@angular/material/list';
import { ReglesComponent } from "./pagesWeb/regles/regles.component"

@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    LoginComponent,
    HomeComponent,
    PlateauComponent,
    JoueurComponent,
    ClassementComponent,
    ReglesComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
