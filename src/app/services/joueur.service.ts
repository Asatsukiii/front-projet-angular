import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Joueur } from '../models/joueur.model';

@Injectable({
  providedIn: 'root'
})
export class JoueurService {
  // Correct backend URL
  private apiUrl = 'http://localhost:8080/joueurs/';

  constructor(private http: HttpClient) {}

  createJoueur(joueur: Joueur): Observable<Joueur> {
    return this.http.post<Joueur>(this.apiUrl, joueur);
  }

  getAllJoueurs(): Observable<Joueur[]> {
    return this.http.get<Joueur[]>(this.apiUrl);
  }

  getJoueurById(id: number): Observable<Joueur> {
    return this.http.get<Joueur>(`${this.apiUrl}${id}`);
  }

  getJoueurByPseudo(pseudo: string): Observable<Joueur> {
    return this.http.get<Joueur>(`${this.apiUrl}pseudo/${pseudo}`);
  }

  updateJoueur(id: number, joueur: Joueur): Observable<Joueur> {
    return this.http.put<Joueur>(`${this.apiUrl}${id}`, joueur);
  }

  deleteJoueur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}`);
  }
}
