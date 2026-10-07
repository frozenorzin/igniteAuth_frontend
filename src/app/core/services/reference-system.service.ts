import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ReferenceSystem } from '../models/reference-system.model';

@Injectable({
  providedIn: 'root'
})
export class ReferenceSystemService {

  private readonly apiUrl =
    'https://localhost:YOUR_PORT/api/referencesystem';

  constructor(private http: HttpClient) {}

  getReferenceSystem(): Observable<ReferenceSystem> {
    return this.http.get<ReferenceSystem>(this.apiUrl);
  }
}