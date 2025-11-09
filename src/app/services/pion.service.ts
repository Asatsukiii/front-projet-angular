import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pion } from '../models/pion.model';
import { environment } from "../../environments/environment"


@Injectable({ providedIn: "root" })
export class PionService {
  private apiUrl = `${environment.apiUrl}/pion`

  constructor(private http: HttpClient) {}

  getAll(): Observable<Pion[]> {
    return this.http.get<Pion[]>(this.apiUrl)
  }

  getById(id: number): Observable<Pion> {
    return this.http.get<Pion>(`${this.apiUrl}/${id}`)
  }

  getByJoueurPartie(idJoueurPartie: number): Observable<Pion[]> {
    return this.http.get<Pion[]>(`${this.apiUrl}/joueur-partie/${idJoueurPartie}`)
  }

  getPionsByJoueur(idJoueur: number): Observable<Pion[]> {
    return this.http.get<Pion[]>(`${this.apiUrl}/joueur/${idJoueur}`)
  }

  getByCase(idCasePlateau: number): Observable<Pion[]> {
    return this.http.get<Pion[]>(`${this.apiUrl}/case/${idCasePlateau}`)
  }

  getByEtat(etat: string): Observable<Pion[]> {
    return this.http.get<Pion[]>(`${this.apiUrl}/etat/${etat}`)
  }

  create(data: { idJoueurPartie: number; idCasePlateau: number; etatPion: string }): Observable<Pion> {
    return this.http.post<Pion>(this.apiUrl, data)
  }

  update(id: number, data: Pion): Observable<Pion> {
    return this.http.put<Pion>(`${this.apiUrl}/${id}`, data)
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }
}
