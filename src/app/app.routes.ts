import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SubsystemsComponent } from './pages/subsystems/subsystems.component';
import { ControlPlaneComponent } from './pages/control-plane/control-plane.component';
import { AboutComponent } from './pages/about/about.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'system',
    component: DashboardComponent
  },
  {
    path: 'subsystems',
    component: SubsystemsComponent
  },
  {
    path: 'control-plane',
    component: ControlPlaneComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];