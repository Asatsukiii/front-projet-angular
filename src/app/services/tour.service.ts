import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tour } from '../models/tour.model';

@Injectable({ providedIn: 'root' })
export class TourService {
  private apiUrl = 'http://localhost:8000/api/tours/';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Tour[]> {
    return this.http.get<Tour[]>(this.apiUrl);
  }

  getById(id: number): Observable<Tour> {
    return this.http.get<Tour>(`${this.apiUrl}${id}/`);
  }

  create(data: Tour): Observable<Tour> {
    return this.http.post<Tour>(this.apiUrl, data);
  }

  update(id: number, data: Tour): Observable<Tour> {
    return this.http.put<Tour>(`${this.apiUrl}${id}/`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
