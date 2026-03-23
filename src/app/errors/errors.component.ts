import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';

@Component({
  selector: 'app-errors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './errors.component.html'
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
}
