import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface User {
  username: string;
  role: 'supervisor' | 'limited';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user = signal<User | null>(null);

  constructor(private router: Router, private http: HttpClient) {}

// auth.service.ts
init(): Promise<void> {          // ← era void
  const token = this.token; // invece di localStorage.getItem('quiz_token')
  const saved = localStorage.getItem('quiz_user');
  if (token && saved) {
    try { this.user.set(JSON.parse(saved)); } catch {}
  }
  return Promise.resolve();      // ← aggiungi questa riga
}

  loginWithToken(username: string, role: string, token: string): void {
    const u: User = { username, role: role as User['role'] };
    this.user.set(u);
    localStorage.setItem('quiz_token', token);
    localStorage.setItem('quiz_user', JSON.stringify(u));
  }

  logout(notify = true): void {
    const token = localStorage.getItem('quiz_token');
    // Chiama il BE per invalidare il sessionToken nel DB
    if (token && notify) {
      this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
        error: () => {} // ignora errori di rete — puliamo comunque
      });
    }
    this.user.set(null);
    localStorage.removeItem('quiz_token');
    localStorage.removeItem('quiz_user');
    this.router.navigate(['/quiz']);
  }

  get currentUser() { return this.user(); }
  get isLoggedIn() { return !!this.user(); }
  get isSupervisor() { return this.user()?.role === 'supervisor'; }
  get username() { return this.user()?.username || ''; }
  get token(): string | null {
  return localStorage.getItem('quiz_token');
}
}