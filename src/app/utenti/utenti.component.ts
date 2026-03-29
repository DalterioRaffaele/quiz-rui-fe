import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-utenti',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utenti.component.html',
  styleUrls: ['./utenti.component.scss']
})
export class UtentiComponent implements OnInit {
  utenti: any[] = [];
  newUsername = '';
  newPassword = '';
  newRole = 'limited';
  errore = '';
  successo = '';
  loading = false;

  resetPasswordUsername = '';
  resetPasswordValore = '';
  resetPasswordErrore = '';
  resetPasswordSuccesso = '';

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('isSupervisor:', this.authService.isSupervisor);
  console.log('currentUser:', this.authService.currentUser);
  console.log('isLoggedIn:', this.authService.isLoggedIn);
    if (!this.authService.isSupervisor) {
      this.router.navigate(['/quiz']);
      return;
    }
    this.caricaUtenti();
  }

  caricaUtenti() {
    this.apiService.getUtenti().subscribe({
      next: u => this.utenti = u,
      error: () => this.errore = 'Errore caricamento utenti'
    });
  }

  creaUtente() {
    if (!this.newUsername.trim() || !this.newPassword.trim()) {
      this.errore = 'Username e password obbligatori';
      return;
    }
    this.loading = true;
    this.errore = '';
    this.successo = '';
    this.apiService.register(this.newUsername, this.newPassword, this.newRole).subscribe({
      next: () => {
        this.successo = `✅ Utente "${this.newUsername}" creato!`;
        this.newUsername = '';
        this.newPassword = '';
        this.newRole = 'limited';
        this.loading = false;
        this.caricaUtenti();
      },
      error: err => {
        this.errore = err.error?.error || '❌ Errore creazione utente';
        this.loading = false;
      }
    });
  }

  eliminaUtente(username: string) {
  if (!confirm(`Eliminare l'utente "${username}"?`)) return;

  console.log('🗑️ Tentativo eliminazione utente:', username);

  this.apiService.deleteUtente(username).subscribe({
    next: (response) => {
      console.log('✅ Eliminazione riuscita, risposta:', response);
      this.caricaUtenti();
    },
    error: (err) => {
      console.error('❌ Errore eliminazione utente:', err);
      console.error('   Status:', err.status);
      console.error('   Message:', err.message);
      console.error('   Body:', err.error);
      this.errore = 'Errore eliminazione utente';
    }
  });
}

  apriResetPassword(username: string) {
    this.resetPasswordUsername = username;
    this.resetPasswordValore = '';
    this.resetPasswordErrore = '';
    this.resetPasswordSuccesso = '';
  }

  confermaResetPassword() {
    if (!this.resetPasswordValore.trim()) {
      this.resetPasswordErrore = 'Inserisci la nuova password';
      return;
    }
    this.apiService.resetPassword(this.resetPasswordUsername, this.resetPasswordValore).subscribe({
      next: () => {
        this.resetPasswordSuccesso = `✅ Password di "${this.resetPasswordUsername}" aggiornata!`;
        this.resetPasswordUsername = '';
        this.resetPasswordValore = '';
      },
      error: err => {
        this.resetPasswordErrore = err.error?.error || '❌ Errore reset password';
      }
    });
  }
}
