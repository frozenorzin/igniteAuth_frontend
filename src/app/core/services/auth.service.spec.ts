import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { AuthService, LoginResponse } from './auth.service';

function createToken(expiresAt: number): string {
  const payload = btoa(JSON.stringify({ exp: Math.floor(expiresAt / 1000) }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `header.${payload}.signature`;
}

function createLoginResponse(expiresAt: number): LoginResponse {
  return {
    accessToken: createToken(expiresAt),
    tokenType: 'Bearer',
    expiresAt: new Date(expiresAt).toISOString(),
    role: 'User'
  };
}

describe('AuthService', () => {
  let service: AuthService | undefined;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    service?.logout();
    httpTestingController.verify();
  });

  it('should be created', () => {
    service = TestBed.inject(AuthService);
    expect(service).toBeTruthy();
  });

  it('posts credentials and stores the backend access token in session storage', () => {
    service = TestBed.inject(AuthService);
    const credentials = { username: 'operator', password: 'secret' };
    const expiresAt = Date.now() + 60_000;
    let receivedResponse = false;

    service.login(credentials).subscribe(() => receivedResponse = true);

    const request = httpTestingController.expectOne('/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    request.flush(createLoginResponse(expiresAt));
    const sessionRequest = httpTestingController.expectOne('/api/auth/session');
    sessionRequest.flush({ authenticated: true, username: 'operator', role: 'User' });

    expect(service.session()?.role).toBe('User');
    expect(receivedResponse).toBeTrue();
    expect(sessionStorage.getItem('access_token')).toBe(createToken(expiresAt));
    expect(service.authenticated()).toBeTrue();
  });

  it('rejects malformed login responses without creating a session', () => {
    service = TestBed.inject(AuthService);
    let failed = false;

    service.login({ username: 'operator', password: 'secret' }).subscribe({
      error: () => failed = true
    });
    httpTestingController.expectOne('/api/auth/login').flush({ token: 'not-the-backend-contract' });

    expect(failed).toBeTrue();
    expect(sessionStorage.getItem('access_token')).toBeNull();
    expect(service.authenticated()).toBeFalse();
  });

  it('restores an unexpired session and clears an expired token', () => {
    const validToken = createToken(Date.now() + 60_000);
    sessionStorage.setItem('access_token', validToken);
    service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.getToken()).toBe(validToken);

    service.logout();
    const expiredToken = createToken(Date.now() - 60_000);
    sessionStorage.setItem('access_token', expiredToken);
    expect(service.isAuthenticated()).toBeFalse();
    expect(sessionStorage.getItem('access_token')).toBeNull();
  });
});
