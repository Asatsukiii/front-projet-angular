import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StatistiquesJoueur } from '../models/statistiques.model';
import { environment } from "../../environments/environment"

@Injectable({
  providedIn: 'root'
})
export class StatistiquesJoueurService {

  // URL
  private apiUrl = `${environment.apiUrl}/statistiquesjoueur`;

  // Injection du HttpClient pour effectuer les requêtes HTTP
  constructor(private http: HttpClient) {}

  // Récupère toutes les statistiques de tous les joueurs
  getAll(): Observable<StatistiquesJoueur[]> {
    return this.http.get<StatistiquesJoueur[]>(this.apiUrl);
  }

  // Récupère les statistiques d'un joueur spécifique par son ID
  getByJoueurId(id: number): Observable<StatistiquesJoueur> {
    return this.http.get<StatistiquesJoueur>(`${this.apiUrl}/joueur/${id}`);
  }

  // Crée un nouvel enregistrement de statistiques pour un joueur
  create(data: StatistiquesJoueur): Observable<StatistiquesJoueur> {
    return this.http.post<StatistiquesJoueur>(this.apiUrl, data);
  }

  // Met à jour les statistiques existantes d'un joueur
  update(id: number, data: StatistiquesJoueur): Observable<StatistiquesJoueur> {
    return this.http.put<StatistiquesJoueur>(`${this.apiUrl}/${id}`, data);
  }

  // Supprime les statistiques d'un joueur par son ID
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
