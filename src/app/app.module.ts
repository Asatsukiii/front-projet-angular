import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from "app-routing.module"
import { AppComponent } from "app.component"

import { NavbarComponent } from "navbar/navbar.component"
import { MatListModule } from "@angular/material/list"
import { HomeComponent } from "pagesWeb/home/home.component"
import { FormsModule } from "@angular/forms"
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"
import { HttpClientModule } from "@angular/common/http"
import { PlateauComponent } from "./pagesWeb/plateau/plateau.component"
import { JoueurComponent } from "./pagesWeb/joueur/joueur.component"
import { ClassementComponent } from "./pagesWeb/classement/classement.component"

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PlateauComponent,
    JoueurComponent,
    ClassementComponent,
    NavbarComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule,
    AppRoutingModule,
    MatListModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
