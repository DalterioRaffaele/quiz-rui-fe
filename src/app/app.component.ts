import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatButtonModule,
    MatSidenavModule, MatTooltipModule, MatDividerModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  sidenavOpen = true;
  isMobile = false;

  constructor(public authService: AuthService) {
    this.authService.init();
  }

  ngOnInit() {
    this.checkMobile();
  }

  @HostListener('window:resize')
  checkMobile() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) this.sidenavOpen = false;
    else this.sidenavOpen = true;
  }

  toggleSidenav() { this.sidenavOpen = !this.sidenavOpen; }
}
