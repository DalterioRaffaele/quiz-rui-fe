import { Injectable, signal } from '@angular/core';

export interface User {
  username: string;
  role: 'supervisor' | 'limited';
  expiresAt: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user = signal<User | null>(null);

  login(username: string, durationDays: number = 7): void {
    const role: User['role'] = ['admin', 'supervisor'].includes(username.toLowerCase())
      ? 'supervisor'
      : 'limited';

    this.user.set({
      username,
      role,
      expiresAt: Date.now() + durationDays * 24 * 60 * 60 * 1000,
    });

    localStorage.setItem('quiz_user', JSON.stringify(this.user()));
  }

  logout(): void {
    this.user.set(null);
    localStorage.removeItem('quiz_user');
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
  get isExpired() {
    return this.user() && Date.now() > this.user()!.expiresAt;
  }

  init(): void {
    const saved = localStorage.getItem('quiz_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as User;
        if (!this.isExpired) this.user.set(parsed);
      } catch {}
    }
  }
}
