import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('quiz_token');
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    tap({
      error: (err) => console.log('🔴 TAP ERROR:', err.status, err.url)
    }),
    catchError((err: HttpErrorResponse) => {
      console.log('🔴 CATCH ERROR:', err.status, err.url);
      if (err.status === 401) {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notify = inject(NotificationService);

  const msg = err.error?.code === 'SESSION_EXPIRED'
    ? '⚠️ Sessione terminata: accesso da altro dispositivo.'
    : 'Sessione scaduta. Effettua di nuovo il login.';

  auth.logout(false);
  
  // ✅ Prima naviga, poi mostra lo snackbar
  router.navigate(['/quiz']).then(() => {
    notify.error(msg);
  });
}
      return throwError(() => err);
    })
  );
};