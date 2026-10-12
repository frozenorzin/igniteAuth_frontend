import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

function createToken(): string {
  const expiry = Math.floor((Date.now() + 60_000) / 1000);
  return `header.${btoa(JSON.stringify({ exp: expiry }))}.signature`;
}

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTestingController: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    sessionStorage.setItem('access_token', createToken());
    authService.isAuthenticated();
  });

  afterEach(() => {
    authService.logout();
    httpTestingController.verify();
  });

  it('adds the bearer token to backend API calls but not external URLs', () => {
    http.get('/api/referencesystem').subscribe();
    const backendRequest = httpTestingController.expectOne('/api/referencesystem');
    expect(backendRequest.request.headers.get('Authorization'))
      .toBe(`Bearer ${authService.getToken()}`);
    backendRequest.flush({});

    http.get('https://example.test/data').subscribe();
    const externalRequest = httpTestingController.expectOne('https://example.test/data');
    expect(externalRequest.request.headers.has('Authorization')).toBeFalse();
    externalRequest.flush({});
  });

  it('never adds the session token to the login request', () => {
    http.post('/api/auth/login', {}).subscribe();
    const loginRequest = httpTestingController.expectOne('/api/auth/login');
    expect(loginRequest.request.headers.has('Authorization')).toBeFalse();
    loginRequest.flush({});
  });

  it('clears the session and redirects after an authenticated API 401', () => {
    const navigation = spyOn(router, 'navigateByUrl').and.resolveTo(true);
    http.get('/api/referencesystem').subscribe({ error: () => undefined });

    httpTestingController.expectOne('/api/referencesystem').flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' }
    );

    expect(sessionStorage.getItem('access_token')).toBeNull();
    expect(authService.authenticated()).toBeFalse();
    expect(navigation).toHaveBeenCalledWith('/login');
  });

  it('retains the session on a server error', () => {
    http.get('/api/referencesystem').subscribe({ error: () => undefined });
    httpTestingController.expectOne('/api/referencesystem').flush(
      { message: 'Server error' },
      { status: 500, statusText: 'Internal Server Error' }
    );

    expect(authService.isAuthenticated()).toBeTrue();
    expect(sessionStorage.getItem('access_token')).not.toBeNull();
  });
});