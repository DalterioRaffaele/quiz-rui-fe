import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';

@Component({
  selector: 'app-errors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './errors.component.html',
  styleUrls: ['./errors.component.scss']
})
export class ErrorsComponent implements OnInit {
  progressi: Record<string, any> = {};

  constructor(private apiService: ApiService) {}

  ngOnInit() { this.caricaProgressi(); }

  caricaProgressi() {
    this.apiService.getProgressi().subscribe({
      next: p => this.progressi = p,
      error: () => {}
    });
  }

  get erroriList() {
    return Object.values(this.progressi)
      .filter((p: any) => p.wrong > 0)
      .sort((a: any, b: any) => b.wrong - a.wrong);
  }

  getAccuracy(item: any): number {
    const tot = (item.correct || 0) + (item.wrong || 0);
    if (tot === 0) return 0;
    return Math.round((item.correct / tot) * 100);
  }

  getAccuracyColor(item: any): string {
    const v = this.getAccuracy(item);
    if (v >= 75) return '#10b981';
    if (v >= 50) return '#f59e0b';
    return '#ef4444';
  }
}