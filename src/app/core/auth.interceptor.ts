import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = localStorage.getItem('quiz_token');

  // Aggiunge il token JWT ad ogni richiesta
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Sessione scaduta o scalzata da altro dispositivo
        authService.logout(false); // false = non richiamare /auth/logout (siamo già sloggati)
      }
      return throwError(() => error);
    })
  );
};