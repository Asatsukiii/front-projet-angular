import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StatistiquesJoueur } from '../models/statistiques.model';

@Injectable({
  providedIn: 'root'
})
export class StatistiquesJoueurService {
  private apiUrl = 'http://localhost:8080/statistiquesjoueur';

  constructor(private http: HttpClient) {}

  getAll(): Observable<StatistiquesJoueur[]> {
    return this.http.get<StatistiquesJoueur[]>(this.apiUrl);
  }

  getByJoueurId(id: number): Observable<StatistiquesJoueur> {
    return this.http.get<StatistiquesJoueur>(`${this.apiUrl}/joueur/${id}`);
  }

  create(data: StatistiquesJoueur): Observable<StatistiquesJoueur> {
    return this.http.post<StatistiquesJoueur>(this.apiUrl, data);
  }

  update(id: number, data: StatistiquesJoueur): Observable<StatistiquesJoueur> {
    return this.http.put<StatistiquesJoueur>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
