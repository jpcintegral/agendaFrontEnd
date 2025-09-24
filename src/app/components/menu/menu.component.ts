


import { Component, ViewEncapsulation  } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Material
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-menu',
  standalone: true,
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  encapsulation: ViewEncapsulation.None, 
  imports: [
   CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class MenuComponent {
  isMobile = false;
  sidenavOpened = true;

  constructor(private router: Router, private breakpointObserver: BreakpointObserver) {
    // Detectar si es móvil o escritorio
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.isMobile = result.matches;
      this.sidenavOpened = !this.isMobile; // escritorio: abierto, móvil: cerrado por defecto
    });
  }

  logout() {
    localStorage.removeItem('jwt');
    this.router.navigate(['/login']);
  }

  toggleSidenav() {
    this.sidenavOpened = !this.sidenavOpened;
  }
}