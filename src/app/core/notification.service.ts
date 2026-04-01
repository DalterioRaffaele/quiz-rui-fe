// core/notification.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  error(msg: string) {
    this.snackBar.open(msg, 'Chiudi', {
      duration: 6000,
      panelClass: ['snackbar-error'],
      verticalPosition: 'top'
    });
  }
}