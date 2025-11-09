import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JoueurPartie } from '../models/joueur-partie.model';
import { environment } from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class JoueurPartieService {

  // URL
  private apiUrl = `${environment.apiUrl}/joueurparties/`;

  constructor(private http: HttpClient) {}

  // Récupère toutes les relations joueur-partie
  getAll(): Observable<JoueurPartie[]> {
    return this.http.get<JoueurPartie[]>(this.apiUrl);
  }

  // Récupère une relation joueur-partie par son identifiant
  getById(id: number): Observable<JoueurPartie> {
    return this.http.get<JoueurPartie>(`${this.apiUrl}${id}/`);
  }

  // Crée une nouvelle relation joueur-partie
  create(data: JoueurPartie): Observable<JoueurPartie> {
    return this.http.post<JoueurPartie>(this.apiUrl, data);
  }

  // Met à jour une relation joueur-partie existante
  updateJoueurPartie(id: number, data: JoueurPartie): Observable<JoueurPartie> {
    return this.http.put<JoueurPartie>(`${this.apiUrl}${id}/`, data);
  }

  // Supprime une relation joueur-partie par son identifiant
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }

  // Récupère toutes les relations joueur-partie pour un joueur spécifique
  getByJoueurId(joueurId: number): Observable<JoueurPartie[]> {
    return this.http.get<JoueurPartie[]>(`${this.apiUrl}joueur/${joueurId}`);
  }
}
