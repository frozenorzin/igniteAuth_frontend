import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
}

const TOKEN_STORAGE_KEY = 'access_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  readonly authenticated = signal(false);
  private expirationTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.restoreSession();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        '/api/auth/login',
        credentials
      )
      .pipe(
        map(response => {
          if (!this.isLoginResponse(response)) {
            throw new Error('Invalid authentication response.');
          }

          return response;
        }),
        tap(response => this.startSession(response.accessToken))
      );
  }

  isAuthenticated(): boolean {
    const token = this.storage?.getItem(TOKEN_STORAGE_KEY);
    const expiresAt = token ? this.readTokenExpiry(token) : null;

    if (!token || !expiresAt || expiresAt <= Date.now()) {
      this.clearSession(false);
      return false;
    }

    this.authenticated.set(true);
    return true;
  }

  getToken(): string | null {
    const token = this.storage?.getItem(TOKEN_STORAGE_KEY);
    const expiresAt = token ? this.readTokenExpiry(token) : null;

    if (!token || !expiresAt || expiresAt <= Date.now()) {
      this.clearSession(Boolean(token));
      return null;
    }

    this.authenticated.set(true);
    return token;
  }

  logout(): void {
    this.clearSession(false);
  }

  private get storage(): Storage | null {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  }

  private restoreSession(): void {
    const token = this.storage?.getItem(TOKEN_STORAGE_KEY);
    const expiresAt = token ? this.readTokenExpiry(token) : null;

    if (token && expiresAt && expiresAt > Date.now()) {
      this.authenticated.set(true);
      this.scheduleExpiration(expiresAt);
      return;
    }

    this.clearSession(false);
  }

  private isLoginResponse(response: unknown): response is LoginResponse {
    if (!response || typeof response !== 'object') {
      return false;
    }

    const result = response as Partial<LoginResponse>;
    const tokenExpiry = typeof result.accessToken === 'string'
      ? this.readTokenExpiry(result.accessToken)
      : null;
    const responseExpiry = typeof result.expiresAt === 'string'
      ? Date.parse(result.expiresAt)
      : NaN;

    return result.tokenType === 'Bearer'
      && typeof result.expiresAt === 'string'
      && Number.isFinite(responseExpiry)
      && responseExpiry > Date.now()
      && tokenExpiry !== null
      && tokenExpiry > Date.now();
  }

  private readTokenExpiry(token: string): number | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3 || parts.some(part => !part)) {
        return null;
      }

      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
      const claims = JSON.parse(decoded) as { exp?: unknown };

      return typeof claims.exp === 'number' && Number.isFinite(claims.exp)
        ? claims.exp * 1000
        : null;
    } catch {
      return null;
    }
  }

  private startSession(token: string): void {
    const expiresAt = this.readTokenExpiry(token);
    if (!expiresAt || expiresAt <= Date.now()) {
      throw new Error('Authentication token is invalid or expired.');
    }

    this.storage?.setItem(TOKEN_STORAGE_KEY, token);
    this.authenticated.set(true);
    this.scheduleExpiration(expiresAt);
  }

  private scheduleExpiration(expiresAt: number): void {
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
    }

    this.expirationTimer = setTimeout(
      () => this.clearSession(true),
      Math.max(0, expiresAt - Date.now())
    );
  }

  private clearSession(redirectToLogin: boolean): void {
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = undefined;
    }

    this.storage?.removeItem(TOKEN_STORAGE_KEY);
    this.authenticated.set(false);

    if (redirectToLogin) {
      void this.router.navigateByUrl('/login');
    }
  }
}