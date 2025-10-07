// src/app/services/case-plateau.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from "rxjs"
import { CasePlateau } from '../models/case-plateau.model';
import { environment } from '../../environments/environment';
import { MOCK_CASES_PLATEAU } from "../mock/cases-plateau.mock"

@Injectable({ providedIn: 'root' })
export class CasePlateauService {
  private apiUrl = `${environment.apiUrl}/cases-plateau/`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CasePlateau[]> {
    //return this.http.get<CasePlateau[]>(this.apiUrl);
    return of(MOCK_CASES_PLATEAU);
  }

  // getById(id: number): Observable<CasePlateau> {
  //   return this.http.get<CasePlateau>(`${this.apiUrl}${id}/`);
  // }

}
