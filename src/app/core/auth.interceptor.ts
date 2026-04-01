import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('quiz_token');
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        const auth = inject(AuthService);
        const router = inject(Router);
        const notify = inject(NotificationService);

        const msg = err.error?.code === 'SESSION_EXPIRED'
          ? '⚠️ Sessione terminata: accesso da altro dispositivo.'
          : 'Sessione scaduta. Effettua di nuovo il login.';

        auth.logout(false);
        notify.error(msg);
        router.navigate(['/quiz']);
      }
      return throwError(() => err); // ← rilancia sempre
    })
  );
};