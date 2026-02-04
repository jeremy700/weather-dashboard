import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { Forecast } from './components/forecast/forecast';

export const routes: Routes = [
    {path: 'dashboard', component: Dashboard},
    {path: 'forecast', component: Forecast},
    {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
    {path: '**', redirectTo: 'dashboard'}
];
