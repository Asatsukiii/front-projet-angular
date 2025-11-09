import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pion } from '../models/pion.model';
import { environment } from "../../environments/environment"


@Injectable({ providedIn: "root" })
export class PionService {

  // URL
  private apiUrl = `${environment.apiUrl}/pion`

  constructor(private http: HttpClient) {}

  // Récupère tous les pions
  getAll(): Observable<Pion[]> {
    return this.http.get<Pion[]>(this.apiUrl)
  }

  // Récupère un pion par son identifiant
  getById(id: number): Observable<Pion> {
    return this.http.get<Pion>(`${this.apiUrl}/${id}`)
  }

  // Récupère tous les pions associés à une relation joueur-partie spécifique
  getByJoueurPartie(idJoueurPartie: number): Observable<Pion[]> {
    return this.http.get<Pion[]>(`${this.apiUrl}/joueur-partie/${idJoueurPartie}`)
  }

  // Récupère tous les pions appartenant à un joueur donné
  getPionsByJoueur(idJoueur: number): Observable<Pion[]> {
    return this.http.get<Pion[]>(`${this.apiUrl}/joueur/${idJoueur}`)
  }

  // Récupère tous les pions présents sur une case spécifique du plateau
  getByCase(idCasePlateau: number): Observable<Pion[]> {
    return this.http.get<Pion[]>(`${this.apiUrl}/case/${idCasePlateau}`)
  }

  // Récupère tous les pions ayant un certain état
  getByEtat(etat: string): Observable<Pion[]> {
    return this.http.get<Pion[]>(`${this.apiUrl}/etat/${etat}`)
  }

  // Crée un nouveau pion
  create(data: { idJoueurPartie: number; idCasePlateau: number; etatPion: string }): Observable<Pion> {
    return this.http.post<Pion>(this.apiUrl, data)
  }

  // Met à jour un pion existant
  update(id: number, data: Pion): Observable<Pion> {
    return this.http.put<Pion>(`${this.apiUrl}/${id}`, data)
  }

  // Supprime un pion par son identifiant
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }
}
