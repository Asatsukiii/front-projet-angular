import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Partie } from '../models/partie.model';

@Injectable({ providedIn: 'root' })
export class PartieService {

  // URL
  private apiUrl = 'http://localhost:8000/api/parties/';

  constructor(private http: HttpClient) {}

  // Récupère toutes les parties
  getAll(): Observable<Partie[]> {
    return this.http.get<Partie[]>(this.apiUrl);
  }

  // Récupère une partie par son identifiant
  getById(id: number): Observable<Partie> {
    return this.http.get<Partie>(`${this.apiUrl}${id}/`);
  }

  // Récupère toutes les parties d'un joueur spécifique
  getPartiesByJoueur(idJoueur: number): Observable<Partie[]> {
    return this.http.get<Partie[]>(`${this.apiUrl}joueur/${idJoueur}`);
  }

  // Crée une nouvelle partie
  create(data: Partie): Observable<Partie> {
    return this.http.post<Partie>(this.apiUrl, data);
  }

  // Met à jour une partie existante
  update(id: number, data: Partie): Observable<Partie> {
    return this.http.put<Partie>(`${this.apiUrl}${id}/`, data);
  }

  // Supprime une partie par son identifiant
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
