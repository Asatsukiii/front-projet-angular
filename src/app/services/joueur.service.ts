import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Joueur } from '../models/joueur.model';
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class JoueurService {

  // URL
  private apiUrl = `${environment.apiUrl}/joueurs`;

  // Injection du HttpClient pour faire les requêtes HTTP
  constructor(private http: HttpClient) {}

  // Crée un nouveau joueur avec le pseudo fourni
  createJoueur(pseudo: string): Observable<Joueur> {
    return this.http.post<Joueur>(`${this.apiUrl}?pseudo=${encodeURIComponent(pseudo)}`, null);
  }

  // Récupère tous les joueurs depuis le backend
  getAllJoueurs(): Observable<Joueur[]> {
    return this.http.get<Joueur[]>(this.apiUrl);
  }

  // Récupère un joueur par son id
  getJoueurById(id: number): Observable<Joueur> {
    return this.http.get<Joueur>(`${this.apiUrl}/${id}`);
  }

  // Récupère un joueur par son pseudo
  getJoueurByPseudo(pseudo: string): Observable<Joueur> {
    return this.http.get<Joueur>(`${this.apiUrl}/pseudo/${pseudo}`);
  }

  // Met à jour un joueur existant
  updateJoueur(id: number, joueur: Joueur): Observable<Joueur> {
    return this.http.put<Joueur>(`${this.apiUrl}/${id}`, joueur);
  }

  // Supprime un joueur par son identifiant
  deleteJoueur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
