import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '@core/services/api.service';
import { 
  Role,
  Permission,
  Schema,
  Collection
} from '@core/models/schema.model';

@Component({
  selector: 'app-role-manager',
  templateUrl: './role-manager.component.html',
  styleUrls: ['./role-manager.component.scss']
})
export class RoleManagerComponent implements OnInit {
  // Data
  roles: Role[] = [];
  schemas: Schema[] = [];
  collections: Collection[] = [];
  
  // Selected role
  selectedRole: Role | null = null;
  
  // UI state
  loading = false;
  showRoleForm = false;
  editMode = false;
  
  // Forms
  roleForm: FormGroup;
  
  // Permission options
  actions = [
    { value: 'create', label: 'Create' },
    { value: 'read', label: 'Read' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'all', label: 'All' }
  ];
  
  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-z0-9_]+$/)]],
      displayName: ['', Validators.required],
      description: [''],
      permissions: this.fb.array([])
    });
  }

  ngOnInit() {
    this.loadRoles();
    this.loadSchemas();
  }

  loadRoles() {
    this.loading = true;
    this.apiService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading roles', error);
        this.loading = false;
        this.snackBar.open('Failed to load roles', 'Close', { duration: 3000 });
      }
    });
  }

  loadSchemas() {
    this.apiService.getSchemas().subscribe({
      next: (schemas) => {
        this.schemas = schemas;
        // Flatten collections from all schemas
        this.collections = schemas.flatMap(schema => schema.collections);
      },
      error: (error) => {
        console.error('Error loading schemas', error);
        this.snackBar.open('Failed to load schemas', 'Close', { duration: 3000 });
      }
    });
  }

  get permissionsArray(): FormArray {
    return this.roleForm.get('permissions') as FormArray;
  }

  createNewRole() {
    this.selectedRole = null;
    this.showRoleForm = true;
    this.editMode = false;
    this.roleForm.reset();
    
    // Clear existing permissions
    while (this.permissionsArray.length !== 0) {
      this.permissionsArray.removeAt(0);
    }
    
    // Add default permissions
    this.addDefaultPermissions();
  }

  addDefaultPermissions() {
    // Add system-level permissions
    this.addPermission('all', 'system.settings');
    this.addPermission('all', 'system.users');
    
    // Add collection permissions for each collection
    this.collections.forEach(collection => {
      this.addPermission('read', `collection.${collection.name}`);
    });
  }

  addPermission(action: string, subject: string, fields: string[] = [], conditions: any = {}) {
    const permissionGroup = this.fb.group({
      action: [action, Validators.required],
      subject: [subject, Validators.required],
      fields: [fields],
      conditions: [conditions]
    });
    
    this.permissionsArray.push(permissionGroup);
  }

  removePermission(index: number) {
    this.permissionsArray.removeAt(index);
  }

  selectRole(role: Role) {
    this.selectedRole = role;
    this.showRoleForm = false;
  }

  editRole(role: Role) {
    this.selectedRole = role;
    this.showRoleForm = true;
    this.editMode = true;
    
    // Reset form
    this.roleForm.reset();
    
    // Clear existing permissions
    while (this.permissionsArray.length !== 0) {
      this.permissionsArray.removeAt(0);
    }
    
    // Set role basic information
    this.roleForm.patchValue({
      name: role.name,
      displayName: role.displayName,
      description: role.description || ''
    });
    
    // Add permissions
    role.permissions.forEach(permission => {
      this.addPermission(
        permission.action, 
        permission.subject, 
        permission.fields || [], 
        permission.conditions || {}
      );
    });
  }

  saveRole() {
    if (this.roleForm.invalid) return;
    
    const formValue = this.roleForm.value;
    
    const role: Partial<Role> = {
      name: formValue.name,
      displayName: formValue.displayName,
      description: formValue.description,
      permissions: formValue.permissions
    };
    
    if (this.editMode && this.selectedRole) {
      // Update existing role
      this.apiService.updateRole(this.selectedRole.id, role).subscribe({
        next: (updatedRole) => {
          const index = this.roles.findIndex(r => r.id === updatedRole.id);
          if (index !== -1) {
            this.roles[index] = updatedRole;
          }
          this.selectedRole = updatedRole;
          this.showRoleForm = false;
          this.snackBar.open('Role updated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error updating role', error);
          this.snackBar.open('Failed to update role', 'Close', { duration: 3000 });
        }
      });
    } else {
      // Create new role
      this.apiService.createRole(role).subscribe({
        next: (newRole) => {
          this.roles.push(newRole);
          this.selectedRole = newRole;
          this.showRoleForm = false;
          this.snackBar.open('Role created successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error creating role', error);
          this.snackBar.open('Failed to create role', 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteRole(role: Role) {
    // In a real app, show a confirmation dialog
    if (!confirm(`Are you sure you want to delete the role "${role.displayName}"?`)) return;
    
    this.apiService.deleteRole(role.id).subscribe({
      next: () => {
        this.roles = this.roles.filter(r => r.id !== role.id);
        if (this.selectedRole?.id === role.id) {
          this.selectedRole = null;
        }
        this.snackBar.open('Role deleted successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error deleting role', error);
        this.snackBar.open('Failed to delete role', 'Close', { duration: 3000 });
      }
    });
  }

  cancelRoleEdit() {
    this.showRoleForm = false;
    this.editMode = false;
  }

  getSubjectDisplay(subject: string): string {
    if (subject.startsWith('system.')) {
      return subject.replace('system.', 'System: ');
    } else if (subject.startsWith('collection.')) {
      const collectionName = subject.replace('collection.', '');
      const collection = this.collections.find(c => c.name === collectionName);
      return collection ? `Collection: ${collection.displayName}` : subject;
    } else {
      return subject;
    }
  }

  getActionDisplay(action: string): string {
    return this.actions.find(a => a.value === action)?.label || action;
  }
}
