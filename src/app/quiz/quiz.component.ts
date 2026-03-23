import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { AuthService } from '../core/auth.service';
import { ApiService } from '../core/api.service';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatFormFieldModule,
    MatSelectModule, MatInputModule, MatRadioModule
  ],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit {
  loginUsername = '';
  activeTab = 'quiz';

  settori = signal<string[]>([]);
  materie = signal<string[]>([]);
  selectedSettore = '';
  selectedMateria = '';
  numDomande = 9;

  domande = signal<any[]>([]);
  risposte: string[] = [];
  risposteCorrette: string[] = [];
  risultati: ('correct' | 'wrong' | '')[] = [];
  quizTerminato = false;

  domandeCount = computed(() => this.domande().length);
  risposteCompletate = computed(() => this.risposte.filter(r => r).length);

  progressi: Record<string, any> = {};

  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn) {
      this.caricaSettori();
      this.caricaProgressi();
    }
  }

  doLogin() {
    if (this.loginUsername.trim()) {
      this.authService.login(this.loginUsername);
      setTimeout(() => { this.caricaSettori(); this.caricaProgressi(); }, 100);
    }
  }

  setTab(tab: string) { this.activeTab = tab; }
  trackByIndex(index: number) { return index; }

  caricaSettori() {
    this.apiService.getSettori().subscribe({
      next: s => {
        this.settori.set(s);
        if (s.length) { this.selectedSettore = s[0]; this.caricaMaterie(); }
      },
      error: () => {
        this.settori.set(['assicurativo', 'riassicurativo']);
        this.selectedSettore = 'assicurativo';
        this.caricaMaterie();
      }
    });
  }

  caricaMaterie() {
    if (!this.selectedSettore) return;
    this.apiService.getMaterie(this.selectedSettore).subscribe({
      next: m => this.materie.set(m),
      error: () => this.materie.set([])
    });
  }

  caricaDomande() {
    if (!this.selectedMateria) { alert('Seleziona una materia!'); return; }
    this.apiService.getDomande(this.selectedSettore, this.selectedMateria, this.numDomande).subscribe({
      next: domande => {
        this.domande.set(domande);
        this.risposte = new Array(domande.length).fill('');
        this.risultati = new Array(domande.length).fill('');
        this.quizTerminato = false;
        this.risposteCorrette = domande.map(d => {
          const opzioni = d.risposte || d.opzioni || [];
          const corretta = opzioni.find((op: any) =>
            op.corretta === true || op.esatta === true || op.correct === true
          );
          return corretta ? (corretta.testo || corretta.risposta || '') : '';
        });
      },
      error: () => alert('Errore caricamento domande')
    });
  }

  getOpzioni(domanda: any): any[] {
    return domanda.risposte || domanda.opzioni || [];
  }

  getOpzioneTesto(op: any): string {
    return typeof op === 'string' ? op : (op.testo || op.risposta || '');
  }

  getOpzioneValue(op: any): string {
    return typeof op === 'string' ? op : (op.testo || op.risposta || JSON.stringify(op));
  }

  selezionaRisposta(index: number, valore: string) {
    this.risposte[index] = valore;
    this.risultati[index] = valore === this.risposteCorrette[index] ? 'correct' : 'wrong';
  }

  get punteggio() {
    return this.risultati.filter(r => r === 'correct').length;
  }

  resetQuiz() {
    this.domande.set([]);
    this.risposte = [];
    this.risultati = [];
    this.risposteCorrette = [];
    this.quizTerminato = false;
    this.selectedMateria = '';
  }

  caricaProgressi() {
    this.apiService.getProgressi().subscribe({
      next: (p: Record<string, any>) => this.progressi = p,
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

  salvaRisposte() {
  alert('Salvato ' + this.risposteCompletate() + '/' + this.domandeCount() + ' risposte!');
}


  get erroriList() {
    return Object.values(this.progressi)
      .filter((p: any) => p.wrong > 0)
      .sort((a: any, b: any) => b.wrong - a.wrong);
  }

  get statsViste() { return Object.values(this.progressi).filter((p: any) => p.seen).length; }
  get statsCorrette() { return Object.values(this.progressi).reduce((s: number, p: any) => s + (p.correct || 0), 0); }
  get statsErrori() { return Object.values(this.progressi).reduce((s: number, p: any) => s + (p.wrong || 0), 0); }
  get statsAccuracy() {
    const tot = this.statsCorrette + this.statsErrori;
    return tot > 0 ? ((this.statsCorrette / tot) * 100).toFixed(1) : '0.0';
  }
}
