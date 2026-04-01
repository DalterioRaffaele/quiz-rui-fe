import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('quiz_token');
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    tap({
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          const auth = inject(AuthService);

          const msg = err.error?.code === 'SESSION_EXPIRED'
            ? '⚠️ Sessione terminata: accesso da altro dispositivo.'
            : 'Sessione scaduta. Effettua di nuovo il login.';

          localStorage.removeItem('quiz_token');
          localStorage.removeItem('quiz_user');
          auth.logout(false);

          alert(msg);
          window.location.href = '/quiz';
        }
      }
    })
  );
};