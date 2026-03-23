import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-progressi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progressi.component.html'
})
export class ProgressiComponent implements OnInit {
  progressi: Record<string, any> = {};

  constructor(private apiService: ApiService, public authService: AuthService) {}

  ngOnInit() { this.caricaProgressi(); }

  caricaProgressi() {
    this.apiService.getProgressi().subscribe({
      next: p => this.progressi = p,
      error: () => {}
    });
  }

  resetProgressi() {
    if (!confirm('Cancellare tutti i progressi?')) return;
    this.apiService.resetProgressi().subscribe({
      next: () => { this.progressi = {}; alert('Progressi cancellati!'); },
      error: () => alert('Errore reset')
    });
  }

  get statsViste() { return Object.values(this.progressi).filter((p: any) => p.seen).length; }
  get statsCorrette() { return Object.values(this.progressi).reduce((s: number, p: any) => s + (p.correct || 0), 0); }
  get statsErrori() { return Object.values(this.progressi).reduce((s: number, p: any) => s + (p.wrong || 0), 0); }
  get erroriCount() { return Object.values(this.progressi).filter((p: any) => p.wrong > 0).length; }
  get statsAccuracy() {
    const tot = this.statsCorrette + this.statsErrori;
    return tot > 0 ? ((this.statsCorrette / tot) * 100).toFixed(1) : '0.0';
  }
}
