import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'https://quiz-rui-be.onrender.com';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('quiz_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ── AUTH ──
  login(username: string, password: string): Observable<{ token: string; username: string; role: string }> {
    return this.http.post<any>(`${this.baseUrl}/auth/login`, { username, password });
  }

  register(username: string, password: string, role = 'limited'): Observable<{ ok: boolean }> {
    return this.http.post<any>(`${this.baseUrl}/auth/register`, { username, password, role }, { headers: this.getHeaders() });
  }

  getUtenti(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/auth/utenti`, { headers: this.getHeaders() });
  }

  deleteUtente(username: string): Observable<{ ok: boolean }> {
    return this.http.delete<any>(`${this.baseUrl}/auth/utenti/${username}`, { headers: this.getHeaders() });
  }

  resetPassword(username: string, newPassword: string): Observable<{ ok: boolean }> {
    return this.http.put<any>(`${this.baseUrl}/auth/utenti/${username}/password`, { newPassword }, { headers: this.getHeaders() });
  }

  // ── DOMANDE ──
  getSettori(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/settori`, { headers: this.getHeaders() });
  }

  getMaterie(settore: string): Observable<string[]> {
    const params = new HttpParams().set('settore', settore);
    return this.http.get<string[]>(`${this.baseUrl}/materie`, { params, headers: this.getHeaders() });
  }

  getDomande(settore: string, materia: string, size: number = 9): Observable<any[]> {
    const params = new HttpParams().set('settore', settore).set('materia', materia).set('size', size.toString());
    return this.http.get<any[]>(`${this.baseUrl}/domande`, { params, headers: this.getHeaders() });
  }

  // ── PROGRESSI ──
  getProgressi(): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(`${this.baseUrl}/progressi`, { headers: this.getHeaders() });
  }

  saveProgresso(payload: any): Observable<{ ok: boolean }> {
    return this.http.post<any>(`${this.baseUrl}/progressi`, payload, { headers: this.getHeaders() });
  }

  resetProgressi(): Observable<{ ok: boolean }> {
    return this.http.delete<any>(`${this.baseUrl}/progressi`, { headers: this.getHeaders() });
  }
}
