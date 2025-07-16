import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

const routes: Routes = [

  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full' // Ensures exact match for empty path
  },
  {
    path: 'tasks',
    loadChildren: () => import(`./tasks-admin/tasks-admin.module`).then(m => m.TasksAdminModule),
    canLoad: [AuthGuard] // Ensure AuthGuard is applied to the tasks module
  },
  {
    path: 'users',
    loadChildren: () => import(`./manage-users/manage-users.module`).then(m => m.ManageUsersModule),
    canLoad: [AuthGuard] // Ensure AuthGuard is applied to the users module
  },
  {
    path: 'login',
    loadChildren: () => import(`./auth/auth.module`).then(m => m.AuthModule)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
