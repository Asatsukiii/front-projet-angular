import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tour } from '../models/tour.model';

// Service Angular pour gérer les tours d'une partie
@Injectable({ providedIn: 'root' })
export class TourService {

  // URL
  private apiUrl = 'http://localhost:8000/api/tours/';

  constructor(private http: HttpClient) {}

  // Récupère tous les tours
  getAll(): Observable<Tour[]> {
    return this.http.get<Tour[]>(this.apiUrl);
  }

  // Récupère un tour par son identifiant
  getById(id: number): Observable<Tour> {
    return this.http.get<Tour>(`${this.apiUrl}${id}/`);
  }

  // Crée un nouveau tour
  create(data: Tour): Observable<Tour> {
    return this.http.post<Tour>(this.apiUrl, data);
  }

  // Met à jour un tour existant
  update(id: number, data: Tour): Observable<Tour> {
    return this.http.put<Tour>(`${this.apiUrl}${id}/`, data);
  }

  // Supprime un tour par son identifiant
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
