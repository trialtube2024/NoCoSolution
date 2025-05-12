import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { User } from '@core/models/schema.model';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  requiredPermission?: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  currentUser: User | null = null;
  navItems: NavItem[] = [
    { 
      label: 'Dashboard', 
      route: '/dashboard', 
      icon: 'dashboard' 
    },
    { 
      label: 'Schema Designer', 
      route: '/schema-designer', 
      icon: 'schema',
      requiredPermission: 'schema:read'
    },
    { 
      label: 'Form Builder', 
      route: '/form-builder', 
      icon: 'dynamic_form',
      requiredPermission: 'form:read'
    },
    { 
      label: 'Workflow Builder', 
      route: '/workflow-builder', 
      icon: 'account_tree',
      requiredPermission: 'workflow:read'
    },
    { 
      label: 'Data Explorer', 
      route: '/data-explorer', 
      icon: 'storage',
      requiredPermission: 'data:read'
    },
    { 
      label: 'Role Manager', 
      route: '/role-manager', 
      icon: 'admin_panel_settings',
      requiredPermission: 'role:read'
    },
    { 
      label: 'Settings', 
      route: '/settings', 
      icon: 'settings',
      requiredPermission: 'settings:read'
    }
  ];

  filteredNavItems: NavItem[] = [];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.filterNavItems();
    });
  }

  filterNavItems() {
    // In a real app, you would check if the user has the required permissions
    // For now, just display all nav items
    this.filteredNavItems = this.navItems;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
  }
}
