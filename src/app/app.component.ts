import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { AuthService } from './core/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
  CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
  MatToolbarModule, MatIconModule, MatButtonModule,
  MatSidenavModule, MatListModule, MatTooltipModule
],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [AuthService]
})
export class AppComponent {
  sidenavOpen = true;

  constructor(public authService: AuthService) {
    this.authService.init();
  }

  toggleSidenav() { this.sidenavOpen = !this.sidenavOpen; }
}
