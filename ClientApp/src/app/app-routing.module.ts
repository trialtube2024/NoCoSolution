import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';

// Components
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { SchemaDesignerComponent } from '@features/schema-designer/schema-designer.component';
import { FormBuilderComponent } from '@features/form-builder/form-builder.component';
import { WorkflowBuilderComponent } from '@features/workflow-builder/workflow-builder.component';
import { RoleManagerComponent } from '@features/role-manager/role-manager.component';
import { DataExplorerComponent } from '@features/data-explorer/data-explorer.component';
import { SettingsComponent } from '@features/settings/settings.component';
import { LoginComponent } from '@features/login/login.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'schema-designer', component: SchemaDesignerComponent },
      { path: 'form-builder', component: FormBuilderComponent },
      { path: 'workflow-builder', component: WorkflowBuilderComponent },
      { path: 'role-manager', component: RoleManagerComponent },
      { path: 'data-explorer', component: DataExplorerComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
