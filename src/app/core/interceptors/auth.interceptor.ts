import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

function isBackendApiRequest(requestUrl: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const backendUrl = new URL('/api/', window.location.origin);
    const targetUrl = new URL(requestUrl, window.location.origin);
    return targetUrl.origin === backendUrl.origin
      && targetUrl.pathname.startsWith(backendUrl.pathname);
  } catch {
    return false;
  }
}

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const targetUrl = new URL(request.url, window.location.origin);
  const isLoginRequest = targetUrl.pathname === '/api/auth/login';

  if (!isBackendApiRequest(request.url) || isLoginRequest) {
    return next(request);
  }

  const token = authService.getToken();
  const authorizedRequest = token && !request.headers.has('Authorization')
    ? request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    })
    : request;
  const authorization = request.headers.get('Authorization');
  const tokenAttached = authorization
    ? authorization.startsWith('Bearer ')
    : Boolean(token);

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse
        && error.status === 401
        && tokenAttached
        && authService.isAuthenticated()
      ) {
        authService.logout();
        void router.navigateByUrl('/login');
      }

      return throwError(() => error);
    })
  );
};