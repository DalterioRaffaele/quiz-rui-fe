import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
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
        const notify = inject(NotificationService);

        const msg = err.error?.code === 'SESSION_EXPIRED'
          ? '⚠️ Sessione terminata: accesso da altro dispositivo.'
          : 'Sessione scaduta. Effettua di nuovo il login.';

        // Pulisci localStorage
        localStorage.removeItem('quiz_token');
        localStorage.removeItem('quiz_user');
        auth.logout(false);

        // Mostra messaggio e reindirizza
        alert(msg); // ← visibile sempre, anche durante il redirect
        window.location.href = '/quiz'; // ← reload completo, nessun problema di routing
      }
      return throwError(() => err);
    })
  );
};