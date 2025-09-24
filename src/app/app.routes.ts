import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { EventListComponent } from './components/event-list/event-list.component';
import { EventFormComponent } from './components/event-form/event-form.component';
import { MenuComponent } from './components/menu/menu.component';
import { AuthGuard } from './guards/auth.guard';
/*
export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'events', component: EventListComponent },
  { path: 'events/new', component: EventFormComponent },
  { path: '**', redirectTo: '' }
];

*/

export const routes: Routes = [
  // Login fuera del layout
  { path: 'login', component: LoginComponent },

  // Área privada con menú
  {
    path: '',
    component: MenuComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'events', component: EventListComponent },
     { path: 'events/new', component: EventFormComponent },

      

      // default → ventas
      { path: '', redirectTo: 'events', pathMatch: 'full' }
    ]
  },

  // Wildcard
  { path: '**', redirectTo: 'events' }
];
