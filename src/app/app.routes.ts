import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'quiz', pathMatch: 'full' },
  { path: 'quiz', loadComponent: () => import('./quiz/quiz.component').then(m => m.QuizComponent) },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'errors', loadComponent: () => import('./errors/errors.component').then(m => m.ErrorsComponent) },
  { path: 'progressi', loadComponent: () => import('./progressi/progressi.component').then(m => m.ProgressiComponent) },
  { path: 'utenti', loadComponent: () => import('./utenti/utenti.component').then(m => m.UtentiComponent) 
},
];
