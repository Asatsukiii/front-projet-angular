import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Partie } from '../models/partie.model';
import { environment } from "../../environments/environment"


@Injectable({ providedIn: 'root' })
export class PartieService {
  private apiUrl = `${environment.apiUrl}/parties`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Partie[]> {
    return this.http.get<Partie[]>(this.apiUrl);
  }

  getById(id: number): Observable<Partie> {
    return this.http.get<Partie>(`${this.apiUrl}${id}/`);
  }

  getPartiesByJoueur(idJoueur: number): Observable<Partie[]> {
    return this.http.get<Partie[]>(`${this.apiUrl}joueur/${idJoueur}`);
  }

  create(data: Partie): Observable<Partie> {
    return this.http.post<Partie>(this.apiUrl, data);
  }

  update(id: number, data: Partie): Observable<Partie> {
    return this.http.put<Partie>(`${this.apiUrl}${id}/`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
