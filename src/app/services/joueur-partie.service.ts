import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JoueurPartie } from '../models/joueur-partie.model';
import {environment} from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class JoueurPartieService {
  private apiUrl = `${environment.apiUrl}/joueurparties/`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<JoueurPartie[]> {
    return this.http.get<JoueurPartie[]>(this.apiUrl);
  }

  getById(id: number): Observable<JoueurPartie> {
    return this.http.get<JoueurPartie>(`${this.apiUrl}${id}/`);
  }

  create(data: JoueurPartie): Observable<JoueurPartie> {
    return this.http.post<JoueurPartie>(this.apiUrl, data);
  }

  updateJoueurPartie(id: number, data: JoueurPartie): Observable<JoueurPartie> {
    return this.http.put<JoueurPartie>(`${this.apiUrl}${id}/`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
