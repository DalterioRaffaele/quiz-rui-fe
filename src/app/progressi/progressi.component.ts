import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-progressi',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterModule],
  templateUrl: './progressi.component.html',
  styleUrls: ['./progressi.component.scss']
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

  getAccuracyColor(): string {
    const v = +this.statsAccuracy;
    if (v >= 75) return '#10b981';
    if (v >= 50) return '#f59e0b';
    return '#ef4444';
  }

  getPreparazione(): number {
    if (this.statsViste === 0) return 0;
    const accuracy = +this.statsAccuracy;
    const viste = Math.min(this.statsViste / 10, 50); // max 50 punti per domande viste
    return Math.min(Math.round((accuracy * 0.5) + viste), 100);
  }

  get topErrori() {
    return Object.values(this.progressi)
      .filter((p: any) => p.wrong > 0)
      .sort((a: any, b: any) => b.wrong - a.wrong)
      .slice(0, 10);
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
