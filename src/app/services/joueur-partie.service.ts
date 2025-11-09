import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JoueurPartie } from '../models/joueur-partie.model';
import { environment } from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class JoueurPartieService {

  // URL
  private apiUrl = `${environment.apiUrl}/joueurparties`;

  constructor(private http: HttpClient) {}

  // Récupère toutes les relations joueur-partie
  getAll(): Observable<JoueurPartie[]> {
    return this.http.get<JoueurPartie[]>(this.apiUrl);
  }

  // Récupère une relation joueur-partie par son identifiant
  getById(id: number): Observable<JoueurPartie> {
    return this.http.get<JoueurPartie>(`${this.apiUrl}/${id}`);
  }

  // Crée une nouvelle relation joueur-partie
  create(data: JoueurPartie): Observable<JoueurPartie> {

    const dto: any = {
      joueurId: (data as JoueurPartie).joueurId,
      partieId: (data as JoueurPartie).partieId,
      couleur: (data as JoueurPartie).couleur,
      classement: (data as JoueurPartie).classement ?? null
    };


    if (!dto.joueurId || !dto.partieId) {
      throw new Error(`Impossible de créer JoueurPartie : idJoueur=${dto.idJoueur}, idPartie=${dto.partieId}`);
    }
    console.log("JoueurPartie : ,idJoueur=",dto.joueurId," idPartie=",dto.partieId)

    return this.http.post<JoueurPartie>(this.apiUrl, dto);
  }

  // Met à jour une relation joueur-partie existante
  updateJoueurPartie(id: number, data: JoueurPartie): Observable<JoueurPartie> {
    return this.http.put<JoueurPartie>(`${this.apiUrl}/${id}/`, data);
  }

  // Supprime une relation joueur-partie par son identifiant
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Récupère toutes les relations joueur-partie pour un joueur spécifique
  getByJoueurId(joueurId:number):  Observable<JoueurPartie[]> {
    return this.http.get<JoueurPartie[]>(`${this.apiUrl}/joueur/${joueurId}`);
  }

  //update le classement du joueur pour cette partie
  updateClassement(id: number, classement: number): Observable<JoueurPartie> {
    const body = { classement };
    return this.http.put<JoueurPartie>(`${this.apiUrl}/${id}?classement=${classement}`, {});
  }
}
