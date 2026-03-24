import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { environment } from '../../environments/environment';


interface Stats {
  total: number;
  correct: number;
  errors: number;
  streak: number;
  globalProgress: number;
}

interface Session {
  date: string;
  total: number;
  score: number;
  category: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  stats: Stats = {
    total: 0,
    correct: 0,
    errors: 0,
    streak: 0,
    globalProgress: 0
  };

  recentSessions: Session[] = [];
  loading = false;

  constructor(
    public authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentSessions();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('quiz_token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadStats(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/stats/summary`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.stats = {
          total: res.totalQuiz ?? 0,
          correct: res.correctPercent ?? 0,
          errors: res.errorsCount ?? 0,
          streak: res.streak ?? 0,
          globalProgress: res.globalProgress ?? 0
        };
        this.loading = false;
      },
      error: () => {
        // fallback dati mock se API non ancora pronta
        this.stats = {
          total: 124,
          correct: 89,
          errors: 18,
          streak: 7,
          globalProgress: 68
        };
        this.loading = false;
      }
    });
  }

  loadRecentSessions(): void {
    this.http.get<any[]>(`${environment.apiUrl}/stats/sessions`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.recentSessions = res.map(s => ({
          date: new Date(s.createdAt).toLocaleDateString('it-IT', {
            day: '2-digit', month: 'short', year: 'numeric'
          }),
          total: s.total,
          score: Math.round((s.correct / s.total) * 100),
          category: s.category ?? 'Generale'
        }));
      },
      error: () => {
        // fallback mock
        this.recentSessions = [
          { date: '24 mar 2026', total: 20, score: 85, category: 'Normativa RUI' },
          { date: '23 mar 2026', total: 15, score: 60, category: 'Intermediari' },
          { date: '22 mar 2026', total: 20, score: 90, category: 'Generale' },
          { date: '21 mar 2026', total: 10, score: 70, category: 'Polizze Vita' },
          { date: '20 mar 2026', total: 20, score: 55, category: 'Danni' },
        ];
      }
    });
  }
}
