import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'https://quiz-rui-be.onrender.com';

  constructor(private http: HttpClient) {}

  private get headers(): { headers: HttpHeaders } {
    const token = localStorage.getItem('quiz_token');
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token ?? ''}` })
    };
  }

  private handle401<T>(obs: Observable<T>): Observable<T> {
    return obs.pipe(
      catchError(err => {
        if (err.status === 401) {
          localStorage.removeItem('quiz_token');
          localStorage.removeItem('quiz_user');
          window.location.href = '/quiz';
        }
        throw err;
      })
    );
  }

  // ── AUTH ──
  login(username: string, password: string) {
    return this.http.post<{ token: string; username: string; role: string }>(
      `${this.baseUrl}/auth/login`, { username, password }
    );
  }

  register(username: string, password: string, role = 'limited') {
    return this.handle401(
      this.http.post<{ ok: boolean }>(`${this.baseUrl}/auth/register`, { username, password, role }, this.headers)
    );
  }

  getUtenti(): Observable<any[]> {
    return this.handle401(this.http.get<any[]>(`${this.baseUrl}/auth/utenti`, this.headers));
  }

  deleteUtente(username: string) {
    return this.handle401(this.http.delete<{ ok: boolean }>(`${this.baseUrl}/auth/utenti/${username}`, this.headers));
  }

  resetPassword(username: string, newPassword: string) {
    return this.handle401(
      this.http.put<{ ok: boolean }>(`${this.baseUrl}/auth/utenti/${username}/password`, { newPassword }, this.headers)
    );
  }

  // ── DOMANDE ──
  getSettori(): Observable<string[]> {
    return this.handle401(this.http.get<string[]>(`${this.baseUrl}/settori`, this.headers));
  }

  getMaterie(settore: string): Observable<string[]> {
    const params = new HttpParams().set('settore', settore);
    return this.handle401(this.http.get<string[]>(`${this.baseUrl}/materie`, { ...this.headers, params }));
  }

  getDomande(settore: string, materia: string, size = 9): Observable<any[]> {
    const params = new HttpParams().set('settore', settore).set('materia', materia).set('size', size.toString());
    return this.handle401(this.http.get<any[]>(`${this.baseUrl}/domande`, { ...this.headers, params }));
  }

  // ── PROGRESSI ──
  getProgressi(): Observable<Record<string, any>> {
    return this.handle401(this.http.get<Record<string, any>>(`${this.baseUrl}/progressi`, this.headers));
  }

  saveProgresso(payload: any) {
    return this.handle401(this.http.post<{ ok: boolean }>(`${this.baseUrl}/progressi`, payload, this.headers));
  }

  resetProgressi() {
    return this.handle401(this.http.delete<{ ok: boolean }>(`${this.baseUrl}/progressi`, this.headers));
  }

  getDomandeByNumeri(numeri: number[]): Observable<any[]> {
    return this.handle401(
      this.http.post<any[]>(`${this.baseUrl}/domande/by-numeri`, { numeri }, this.headers)
    );
  }
}