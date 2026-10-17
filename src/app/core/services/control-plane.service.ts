import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ControlPlaneRequest {
  referenceSystemId: number;
  subSystemId: string;
  subSystem: string;
  intent: string;
  command: string;
}

export interface ControlPlaneResponse {
  cpcId: number;
  intent: string;
  command: string;
  subSystem: string;
  decision: string;
  reasonCode: string;
  message: string;
  timeStamp: string;
}

@Injectable({ providedIn: 'root' })
export class ControlPlaneService {
  constructor(private http: HttpClient) {}
  decide(request: ControlPlaneRequest): Observable<ControlPlaneResponse> {
    return this.http.post<ControlPlaneResponse>('/api/ControlPlane/decide', request);
  }
}
