import { RegisterComponent } from './auth/register/register.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './shared/components/dashboard/dashboard.component';
import { AuthGuardService } from './guards/check-login.guard';

const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'singup', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuardService] },
/*     { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: '',
        component: PagesComponent, children: [
            { path: 'dashboard', loadChildren: './pages/dashboard/dashboard.module#DashboardModule', data: { breadcrumb: 'Dashboard' } },
        ]
    },
    { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
    { path: '**', redirectTo: 'login', pathMatch: 'full' }
 */
        /*     { path : 'registro', component: RegisterComponent, canActivate: [LoginGuard]},
        { path: 'error', component: ERROR_COMPONENT_TYPE, data: { breadcrumb: 'Error' } }, */
    { path: '**', redirectTo: 'dashboard', pathMatch: 'full' }

];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule { }
