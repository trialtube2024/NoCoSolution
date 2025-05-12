import { Component, OnInit } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { forkJoin } from 'rxjs';
import { Schema, FormConfig, Workflow, Role } from '@core/models/schema.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = true;
  error = false;
  
  schemas: Schema[] = [];
  forms: FormConfig[] = [];
  workflows: Workflow[] = [];
  roles: Role[] = [];
  
  // Quick stats
  totalCollections = 0;
  totalForms = 0;
  totalWorkflows = 0;
  totalRoles = 0;

  // Data for activity chart
  chartData = [
    { name: 'Data Records', value: 0 },
    { name: 'Form Submissions', value: 0 },
    { name: 'Workflow Executions', value: 0 },
    { name: 'API Requests', value: 0 }
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    forkJoin({
      schemas: this.apiService.getSchemas(),
      forms: this.apiService.getForms(),
      workflows: this.apiService.getWorkflows(),
      roles: this.apiService.getRoles()
    }).subscribe({
      next: (result) => {
        this.schemas = result.schemas;
        this.forms = result.forms;
        this.workflows = result.workflows;
        this.roles = result.roles;
        
        // Calculate totals
        this.calculateStatistics();
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  calculateStatistics() {
    // Count collections across all schemas
    this.totalCollections = this.schemas.reduce((total, schema) => total + schema.collections.length, 0);
    this.totalForms = this.forms.length;
    this.totalWorkflows = this.workflows.length;
    this.totalRoles = this.roles.length;
    
    // TODO: In a real application, we would get these metrics from the API
    // For now, just show some demo data
    this.chartData = [
      { name: 'Data Records', value: 1250 },
      { name: 'Form Submissions', value: 830 },
      { name: 'Workflow Executions', value: 430 },
      { name: 'API Requests', value: 2400 }
    ];
  }

  refresh() {
    this.loadDashboardData();
  }
}
