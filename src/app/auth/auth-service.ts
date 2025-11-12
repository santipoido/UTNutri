// src/app/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY = 'logged_in';

  private readonly USER = 'nutri2025';
  private readonly PASS = 'utnutri123';

  private router = inject(Router);

  login(user: string, pass: string): boolean {
    if (user === this.USER && pass === this.PASS) {
      sessionStorage.setItem(this.KEY, 'true');
      return true;
    }
    return false;
  }

  logout(): void {
    sessionStorage.removeItem(this.KEY);
    this.router.navigateByUrl('/login');
  }

  isLoggedIn(): boolean {
    return sessionStorage.getItem(this.KEY) === 'true';
  }
}
