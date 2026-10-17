import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loading = false;
  errorMessage = '';

  loginForm;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.nonNullable.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login(): void {

    if (this.loading) return;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const credentials = this.loginForm.getRawValue();


    this.authService.login(credentials).subscribe({
      next: () => {
        this.loading = false;
        this.loginForm.controls.password.reset();
        void this.router.navigate(['/']);
      },

      error: (error: unknown) => {
        this.loading = false;
        this.loginForm.controls.password.reset();
        this.errorMessage = error instanceof HttpErrorResponse && error.status === 401
          ? 'Invalid username or password.' : 'Unable to sign in. Check the API connection and try again.';
      }
    });
  }
}