import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CasePlateau } from '../models/case-plateau.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CasePlateauService {

  // URL
  private apiUrl = `${environment.apiUrl}/caseplateau`;

  // Stockage en cache pour éviter les requêtes répétées
  private cache: CasePlateau[] | null = null;

  constructor(private http: HttpClient) {}

  // Récupère toutes les cases du plateau.
  getAll(): Observable<CasePlateau[]> {
    if (this.cache) {
      return of(this.cache);
    }

    return this.http.get<CasePlateau[]>(this.apiUrl).pipe(
      tap((cases) => {
        this.cache = cases;
      }),
      catchError((err) => {
        console.error('Erreur lors du chargement des cases du plateau :', err);
        return of([]);
      })
    );
  }

  reload(): Observable<CasePlateau[]> {
    this.cache = null; // Réinitialisation du cache
    return this.getAll();
  }
}
