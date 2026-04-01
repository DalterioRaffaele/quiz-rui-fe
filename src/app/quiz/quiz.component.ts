import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ApiService } from '../core/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    MatCardModule, MatButtonModule, MatFormFieldModule,
    MatSelectModule, MatInputModule, MatRadioModule,
    MatIconModule, MatProgressSpinnerModule  // ← aggiunti
  ],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit {

  // ── LOGIN (vecchie props rinominate per il nuovo HTML) ──
  loginUsername = '';
  loginPassword = '';
  loginError = '';
  loginLoading = false;

  // ← NUOVE: alias usati dal nuovo HTML
  username = '';           // [(ngModel)]="username"
  password = '';           // [(ngModel)]="password"
  hidePassword = true;
  showLogin = false;
  loading = false;
  errorMsg = '';

  // ── QUIZ MODE (nuovo HTML) ──
  mode: 'random' | 'errors' | 'topic' = 'random';
  quizStarted = false;
  currentIndex = 0;
  currentQuestion: any = null;
  selectedIndex: number | null = null;
  answered = false;
  isCorrect = false;
  total = 0;
  letters = ['A', 'B', 'C', 'D', 'E'];

  // ── ESISTENTI ──
  activeTab = 'quiz';
  settori = signal<string[]>([]);
  materie = signal<string[]>([]);
  selectedSettore = '';
  selectedMateria = '';
  numDomande = 20;
  private slideTimer: any;

  domande = signal<any[]>([]);
  risposte = signal<string[]>([]);
  risposteCorrette: string[] = [];
  risultati = signal<('correct' | 'wrong' | '')[]>([]);
  quizTerminato = false;

  domandeCount = computed(() => this.domande().length);
  risposteCompletate = computed(() => this.risposte().filter(r => r !== '').length);

  progressi: Record<string, any> = {};
  private opzioniMescolate = new Map<number, any[]>();

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn) {
      this.caricaSettori();
      this.caricaProgressi();
    }
  }

  // ── LOGIN (usato dal nuovo HTML con login()) ──
  login() {
    const u = this.username || this.loginUsername;
    const p = this.password || this.loginPassword;
    if (!u.trim() || !p.trim()) return;
    this.errorMsg = '';
    this.loading = true;
    this.apiService.login(u, p).subscribe({
      next: res => {
        this.authService.loginWithToken(res.username, res.role, res.token);
        this.loading = false;
        this.showLogin = false;
        if (this.slideTimer) clearInterval(this.slideTimer);
        this.caricaSettori();
        this.caricaProgressi();
      },
      error: () => {
        this.errorMsg = 'Username o password non validi';
        this.loading = false;
      }
    });
  }

  // alias per compatibilità vecchio HTML
  doLogin() { this.login(); }

avviaQuiz() {
  if (this.mode === 'errors') {
    const errori = this.erroriList;
    if (!errori.length) { alert('Nessun errore da ripassare!'); return; }

    const numeriErrori = new Set(errori.map((e: any) => String(e.numero)));
    const settore = errori[0]?.settore || this.selectedSettore;

    // Carica tutte le domande del settore senza filtro materia, size grande
    this.apiService.getDomande(settore, '', 9999).subscribe({
      next: (tutte: any[]) => {
        const domandeErrori = tutte.filter(d => numeriErrori.has(String(d.numero)));
        this.inizializzaQuiz(domandeErrori.length ? domandeErrori : tutte.slice(0, 20));
      },
      error: () => alert('Errore caricamento domande')
    });
    return;
  }

  if (this.mode === 'topic' && !this.selectedMateria) {
    alert('Seleziona una materia!'); return;
  }
  this.apiService.getDomande(
    this.selectedSettore,
    this.selectedMateria || '',
    this.numDomande
  ).subscribe({
    next: (domande: any[]) => this.inizializzaQuiz(domande),
    error: () => alert('Errore caricamento domande')
  });
}



isOpzioneCorretta(op: any): boolean {
  return op.corretta === true || op.esatta === true || op.correct === true;
}


  private inizializzaQuiz(domande: any[]) {
    this.quizStarted = true;
    this.currentIndex = 0;
    this.total = domande.length;
    this.domande.set(domande);
    this.opzioniMescolate.clear();
    this.risposte.set(new Array(domande.length).fill(''));
    this.risultati.set(new Array(domande.length).fill(''));
    this.quizTerminato = false;
    this.risposteCorrette = domande.map(d => {
      const opzioni = d.risposte || d.opzioni || [];
      const corretta = opzioni.find((op: any) =>
        op.corretta === true || op.esatta === true || op.correct === true
      );
      return corretta ? (corretta.testo || corretta.risposta || '') : '';
    });
    this.caricaDomandaCorrente();
  }

  private caricaDomandaCorrente() {
  const domande = this.domande();
  if (this.currentIndex < domande.length) {
    const d = domande[this.currentIndex];
    this.currentQuestion = {
      ...d,
      text: d.testo || d.domanda || d.text || '',        // ← aggiungi questo
      category: d.materia || d.settore || 'Generale',    // ← e questo
      options: this.getOpzioni(d, this.currentIndex).map(op => ({
        text: this.getOpzioneTesto(op),
        value: this.getOpzioneValue(op),
        correct: op.corretta === true || op.esatta === true || op.correct === true
      }))
    };
    this.selectedIndex = null;
    this.answered = false;
    this.isCorrect = false;
  }
}


  selectOption(i: number) {
    if (this.answered) return;
    this.selectedIndex = i;
  }

  confirmAnswer() {
    if (this.selectedIndex === null || this.answered) return;
    this.answered = true;
    const opt = this.currentQuestion.options[this.selectedIndex];
    this.isCorrect = opt.correct;

    // salva risultato
    const r = [...this.risultati()];
    r[this.currentIndex] = this.isCorrect ? 'correct' : 'wrong';
    this.risultati.set(r);

    const rs = [...this.risposte()];
    rs[this.currentIndex] = opt.value;
    this.risposte.set(rs);
  }

  nextQuestion() {
    this.currentIndex++;
    if (this.currentIndex < this.total) {
      this.caricaDomandaCorrente();
    } else {
      this.quizTerminato = true;
      this.quizStarted = false;
      this.salvaRisposte();
    }
  }

  skipQuestion() {
    this.currentIndex++;
    if (this.currentIndex < this.total) {
      this.caricaDomandaCorrente();
    } else {
      this.quizTerminato = true;
      this.quizStarted = false;
    }
  }

  // ── ESISTENTI INVARIATI ──
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
      next: domande => this.inizializzaQuiz(domande),
      error: () => alert('Errore caricamento domande')
    });
  }

  getOpzioni(domanda: any, index: number): any[] {
    if (!this.opzioniMescolate.has(index)) {
      const opzioni = [...(domanda.risposte || domanda.opzioni || [])];
      for (let i = opzioni.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opzioni[i], opzioni[j]] = [opzioni[j], opzioni[i]];
      }
      this.opzioniMescolate.set(index, opzioni);
    }
    return this.opzioniMescolate.get(index)!;
  }

  getOpzioneTesto(op: any): string {
    return typeof op === 'string' ? op : (op.testo || op.risposta || '');
  }

  getOpzioneValue(op: any): string {
    return typeof op === 'string' ? op : (op.testo || op.risposta || JSON.stringify(op));
  }

  selezionaRisposta(index: number, valore: string) {
    const r = [...this.risposte()];
    r[index] = valore;
    this.risposte.set(r);
    const ris = [...this.risultati()];
    ris[index] = valore === this.risposteCorrette[index] ? 'correct' : 'wrong';
    this.risultati.set(ris);
  }

  get punteggio() {
    return this.risultati().filter(r => r === 'correct').length;
  }

salvaRisposte() {
  const domande = this.domande();
  const risultatiArr = this.risultati();

  const salvataggi = domande.reduce((acc: any[], d, i) => {
    if (!risultatiArr[i]) return acc;
    const progressoCorrente = this.progressi[String(d.numero)] || { correct: 0, wrong: 0 };
    const isCorrect = risultatiArr[i] === 'correct';
    const isWrong = risultatiArr[i] === 'wrong';

    acc.push(this.apiService.saveProgresso({
      numero: d.numero,
      domanda: d.testo || d.domanda || '',
      materia: d.materia || '',
      settore: d.settore || '',
      seen: true,
      correct: (progressoCorrente.correct || 0) + (isCorrect ? 1 : 0),
      wrong: this.mode === 'errors' && isCorrect
        ? 0
        : (progressoCorrente.wrong || 0) + (isWrong ? 1 : 0),
      lastResult: risultatiArr[i]
    }));
    return acc;
  }, []);

  if (!salvataggi.length) {
    this.router.navigate(['/progressi']);
    return;
  }

  forkJoin(salvataggi).subscribe({
    next: () => this.router.navigate(['/progressi']),
    error: () => alert('Errore nel salvataggio dei progressi')
  });
}


  resetQuiz() {
    this.domande.set([]);
    this.risposte.set([]);
    this.risultati.set([]);
    this.risposteCorrette = [];
    this.quizTerminato = false;
    this.quizStarted = false;
    this.currentQuestion = null;
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
