import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'month', pathMatch: 'full' },
  {
    path: 'year',
    loadComponent: () => import('./components/year-view/year-view.component').then(m => m.YearViewComponent),
  },
  {
    path: 'month',
    loadComponent: () => import('./components/month-view/month-view.component').then(m => m.MonthViewComponent),
  },
  {
    path: 'week',
    loadComponent: () => import('./components/week-view/week-view.component').then(m => m.WeekViewComponent),
  },
  { path: '**', redirectTo: 'month' },
];
