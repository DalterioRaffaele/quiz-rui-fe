import { Injectable, signal } from '@angular/core';

export interface User {
  username: string;
  role: 'supervisor' | 'limited';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user = signal<User | null>(null);

  init(): void {
    const token = localStorage.getItem('quiz_token');
    const saved = localStorage.getItem('quiz_user');
    if (token && saved) {
      try { this.user.set(JSON.parse(saved)); } catch {}
    }
  }

  loginWithToken(username: string, role: string, token: string): void {
    const u: User = { username, role: role as User['role'] };
    this.user.set(u);
    localStorage.setItem('quiz_token', token);
    localStorage.setItem('quiz_user', JSON.stringify(u));
  }

  logout(): void {
    this.user.set(null);
    localStorage.removeItem('quiz_token');
    localStorage.removeItem('quiz_user');
  }

  get currentUser() { return this.user(); }
  get isLoggedIn() { return !!this.user(); }
  get isSupervisor() { return this.user()?.role === 'supervisor'; }
  get username() { return this.user()?.username || ''; }
}
