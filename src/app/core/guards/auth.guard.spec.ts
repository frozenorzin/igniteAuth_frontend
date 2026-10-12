import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree, provideRouter } from '@angular/router';
import { AuthService } from '../services/auth.service';

import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let isAuthenticated: jasmine.Spy;

  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    isAuthenticated = jasmine.createSpy('isAuthenticated');
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated } },
        provideRouter([])
      ]
    });
  });

  it('allows an authenticated session', () => {
    isAuthenticated.and.returnValue(true);
    expect(executeGuard({} as never, {} as never)).toBeTrue();
  });

  it('redirects unauthenticated navigation to login', () => {
    isAuthenticated.and.returnValue(false);
    const result = executeGuard({} as never, {} as never) as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login');
  });
});
