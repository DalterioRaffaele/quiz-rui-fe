import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler,
  HttpEvent, HttpErrorResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('quiz_token');
    if (token) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(req).pipe(
      tap({
        error: (err: HttpErrorResponse) => {
          if (err.status === 401) {
            const msg = err.error?.code === 'SESSION_EXPIRED'
              ? '⚠️ Sessione terminata: accesso da altro dispositivo.'
              : 'Sessione scaduta. Effettua di nuovo il login.';

            localStorage.removeItem('quiz_token');
            localStorage.removeItem('quiz_user');
            alert(msg);
            window.location.href = '/quiz';
          }
        }
      })
    );
  }
}