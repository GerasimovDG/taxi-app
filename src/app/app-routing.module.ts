import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainLayoutComponent} from './main-layout/main-layout.component';
import {LoginPageComponent} from './login-page/login-page.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {MainPageComponent} from './main-page/main-page.component';
import {AuthGuard} from './validators/auth.guard';
import {AdminLoginComponent} from './admin/components/admin-login/admin-login.component';
import {AdminMainPageComponent} from './admin/components/admin-main-page/admin-main-page.component';
import {DriverPageComponent} from './driver-page/driver-page.component';

const routes: Routes = [
  { path: '', component: MainLayoutComponent, children: [
      // { path: '', redirectTo: '/signin', pathMatch: 'full', canActivate: [AuthGuard]},
      { path: '', redirectTo: '/signin', pathMatch: 'full'},
      // { path: 'order', component: MainPageComponent},
      { path: 'order/:id', component: MainPageComponent},
      { path: 'driver', redirectTo: '/signin', pathMatch: 'full'},
      { path: 'driver/:id', component: DriverPageComponent}
    // ], canActivateChild: [AuthGuard] },
    ] },
  { path: 'signin', component: LoginPageComponent},
  { path: 'admin', component: AdminLoginComponent},
  { path: 'admin/:id', component: AdminMainPageComponent},
  { path: '**', component: PageNotFoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
