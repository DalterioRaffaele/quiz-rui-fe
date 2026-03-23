import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      { path: '', loadComponent: () => import('./app/quiz/quiz.component').then(m => m.QuizComponent) },
      { path: '**', loadComponent: () => import('./app/quiz/quiz.component').then(m => m.QuizComponent) }
    ]),
    provideHttpClient(),
    provideAnimationsAsync()
  ]
}).catch(err => console.error(err));
