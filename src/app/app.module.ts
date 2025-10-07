import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// ⚙️ Angular Material
import { MatListModule } from '@angular/material/list';

// 🧩 Tes composants
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { PlateauComponent } from './plateau/plateau.component';
import { JoueurComponent } from './joueur/joueur.component';
import { ClassementComponent } from './classement/classement.component';
import { NavbarComponent } from './navbar/navbar.component';

// 🧭 Routing
import { AppRoutingModule } from './app-routing.module';

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
