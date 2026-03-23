import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'https://quiz-rui-be.onrender.com';

  constructor(private http: HttpClient) {}

  getSettori(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/settori`);
  }

  getMaterie(settore: string): Observable<string[]> {
    const params = new HttpParams().set('settore', settore);
    return this.http.get<string[]>(`${this.baseUrl}/materie`, { params });
  }

  getDomande(settore: string, materia: string, size: number = 9): Observable<any[]> {
    const params = new HttpParams()
      .set('settore', settore)
      .set('materia', materia)
      .set('size', size.toString());
    return this.http.get<any[]>(`${this.baseUrl}/domande`, { params });
  }

  getProgressi(): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(`${this.baseUrl}/progressi`);
  }

  saveProgresso(payload: any): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.baseUrl}/progressi`, payload);
  }

  resetProgressi(): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.baseUrl}/progressi`);
  }
}
