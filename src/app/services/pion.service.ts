import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pion } from '../models/pion.model';

@Injectable({ providedIn: 'root' })
export class PionService {
  private apiUrl = 'http://localhost:8000/api/pions/';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Pion[]> {
    return this.http.get<Pion[]>(this.apiUrl);
  }

  getById(id: number): Observable<Pion> {
    return this.http.get<Pion>(`${this.apiUrl}${id}/`);
  }

  create(data: Pion): Observable<Pion> {
    return this.http.post<Pion>(this.apiUrl, data);
  }

  update(id: number, data: Pion): Observable<Pion> {
    return this.http.put<Pion>(`${this.apiUrl}${id}/`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
