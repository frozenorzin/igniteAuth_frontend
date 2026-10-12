import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SubsystemsComponent } from './pages/subsystems/subsystems.component';
import { ControlPlaneComponent } from './pages/control-plane/control-plane.component';
import { AboutComponent } from './pages/about/about.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'system',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard],
    pathMatch: 'full'
  },
  {
    path: 'subsystems',
    component: SubsystemsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'control-plane',
    component: ControlPlaneComponent,
    canActivate: [authGuard]
  },
  {
    path: 'about',
    component: AboutComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];