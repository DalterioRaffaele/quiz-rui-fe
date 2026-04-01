import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('quiz_token');
  
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  } // ← parentesi di chiusura if

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        const auth = inject(AuthService);
        const router = inject(Router);
        const snackBar = inject(MatSnackBar);

        const msg = err.error?.code === 'SESSION_EXPIRED'
          ? '⚠️ Sessione terminata: hai effettuato accesso da un altro dispositivo.'
          : 'Sessione scaduta. Effettua di nuovo il login.';

        auth.logout(false);
        snackBar.open(msg, 'Chiudi', { duration: 6000, panelClass: ['snackbar-error'] });
        router.navigate(['/quiz']);
      }
      return throwError(() => err);
    })
  );
};