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
  private pingIntervalId: ReturnType<typeof setInterval> | null = null;
  private readonly pingEveryMs = 30000; // 30 secondi

  constructor(private router: Router, private http: HttpClient) {}

  init(): Promise<void> {
    const token = localStorage.getItem('quiz_token');
    const saved = localStorage.getItem('quiz_user');

    if (token && saved) {
      try {
        this.user.set(JSON.parse(saved));
        this.startPing();
      } catch {
        localStorage.removeItem('quiz_token');
        localStorage.removeItem('quiz_user');
        this.stopPing();
      }
    }

    return Promise.resolve();
  }

  loginWithToken(username: string, role: string, token: string): void {
    const u: User = { username, role: role as User['role'] };
    this.user.set(u);
    localStorage.setItem('quiz_token', token);
    localStorage.setItem('quiz_user', JSON.stringify(u));
    this.startPing();
  }

  logout(notify = true): void {
    const token = localStorage.getItem('quiz_token');

    this.stopPing();

    if (token && notify) {
      this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
        next: () => {},
        error: () => {}
      });
    }

    this.user.set(null);
    localStorage.removeItem('quiz_token');
    localStorage.removeItem('quiz_user');
    this.router.navigate(['/quiz']);
  }

  private startPing(): void {
    this.stopPing();

    this.pingIntervalId = setInterval(() => {
      const token = localStorage.getItem('quiz_token');

      if (!token || !this.user()) {
        this.stopPing();
        return;
      }

      this.http.post(`${environment.apiUrl}/auth/ping`, {}).subscribe({
        next: () => {},
        error: (err) => {
          if (err?.status === 401) {
            this.logout(false);
          }
        }
      });
    }, this.pingEveryMs);
  }

  private stopPing(): void {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
  }

  get currentUser() {
    return this.user();
  }

  get isLoggedIn() {
    return !!this.user();
  }

  get isSupervisor() {
    return this.user()?.role === 'supervisor';
  }

  get username() {
    return this.user()?.username || '';
  }

  get token(): string | null {
    return localStorage.getItem('quiz_token');
  }
}