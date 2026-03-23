import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="padding: 60px 24px; text-align: center; max-width: 800px; margin: 0 auto;">
      <h1 style="font-size: 48px; margin-bottom: 16px; color: #3f51b5;">Dashboard</h1>
      <p style="font-size: 18px; color: #666; margin-bottom: 48px;">Statistiche e riepiloghi (in arrivo)</p>
      <div style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
        <h3>Prossimamente:</h3>
        <ul style="text-align: left; max-width: 500px; margin: 24px auto;">
          <li>Grafici progressi</li>
          <li>Lista errori</li>
          <li>Statistiche per materia</li>
          <li>Esportazione PDF</li>
        </ul>
        <a routerLink="/quiz" style="
            display: inline-block; 
            padding: 16px 32px; 
            background: #3f51b5; 
            color: white; 
            text-decoration: none; 
            border-radius: 50px; 
            font-weight: 500; 
            margin-top: 24px;
          ">
          ← Torna al Quiz
        </a>
      </div>
    </div>
  `
})
export class DashboardComponent {}
