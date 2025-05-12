import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '@core/services/api.service';
import { SystemSettings, Plugin, Role } from '@core/models/schema.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  // Data
  settings: SystemSettings | null = null;
  plugins: Plugin[] = [];
  roles: Role[] = [];
  
  // UI state
  loading = false;
  activeTab = 0;
  
  // Forms
  generalSettingsForm: FormGroup;
  
  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.generalSettingsForm = this.fb.group({
      appName: ['', Validators.required],
      logo: [''],
      theme: ['light'],
      locale: ['en-US'],
      dateFormat: ['MM/DD/YYYY'],
      timeFormat: ['h:mm A'],
      defaultRole: ['']
    });
  }

  ngOnInit() {
    this.loadSettings();
    this.loadPlugins();
    this.loadRoles();
  }

  loadSettings() {
    this.loading = true;
    this.apiService.getSettings().subscribe({
      next: (settings) => {
        this.settings = settings;
        this.populateGeneralSettingsForm(settings);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading settings', error);
        this.loading = false;
        this.snackBar.open('Failed to load settings', 'Close', { duration: 3000 });
      }
    });
  }

  loadPlugins() {
    this.apiService.getPlugins().subscribe({
      next: (plugins) => {
        this.plugins = plugins;
      },
      error: (error) => {
        console.error('Error loading plugins', error);
        this.snackBar.open('Failed to load plugins', 'Close', { duration: 3000 });
      }
    });
  }

  loadRoles() {
    this.apiService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        console.error('Error loading roles', error);
        this.snackBar.open('Failed to load roles', 'Close', { duration: 3000 });
      }
    });
  }

  populateGeneralSettingsForm(settings: SystemSettings) {
    this.generalSettingsForm.patchValue({
      appName: settings.appName,
      logo: settings.logo || '',
      theme: settings.theme || 'light',
      locale: settings.locale || 'en-US',
      dateFormat: settings.dateFormat || 'MM/DD/YYYY',
      timeFormat: settings.timeFormat || 'h:mm A',
      defaultRole: settings.defaultRole || ''
    });
  }

  saveGeneralSettings() {
    if (this.generalSettingsForm.invalid || !this.settings) return;
    
    const updatedSettings: Partial<SystemSettings> = {
      ...this.settings,
      ...this.generalSettingsForm.value
    };
    
    this.apiService.updateSettings(updatedSettings).subscribe({
      next: (settings) => {
        this.settings = settings;
        this.populateGeneralSettingsForm(settings);
        this.snackBar.open('Settings updated successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating settings', error);
        this.snackBar.open('Failed to update settings', 'Close', { duration: 3000 });
      }
    });
  }

  togglePlugin(plugin: Plugin) {
    const action = plugin.enabled ? this.apiService.disablePlugin(plugin.id) : this.apiService.enablePlugin(plugin.id);
    
    action.subscribe({
      next: (updatedPlugin) => {
        // Update plugin in the list
        const index = this.plugins.findIndex(p => p.id === updatedPlugin.id);
        if (index !== -1) {
          this.plugins[index] = updatedPlugin;
        }
        
        this.snackBar.open(`Plugin ${updatedPlugin.enabled ? 'enabled' : 'disabled'} successfully`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error(`Error ${plugin.enabled ? 'disabling' : 'enabling'} plugin`, error);
        this.snackBar.open(`Failed to ${plugin.enabled ? 'disable' : 'enable'} plugin`, 'Close', { duration: 3000 });
      }
    });
  }

  updatePluginSettings(plugin: Plugin, settings: any) {
    this.apiService.updatePluginSettings(plugin.id, settings).subscribe({
      next: (updatedPlugin) => {
        // Update plugin in the list
        const index = this.plugins.findIndex(p => p.id === updatedPlugin.id);
        if (index !== -1) {
          this.plugins[index] = updatedPlugin;
        }
        
        this.snackBar.open('Plugin settings updated successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating plugin settings', error);
        this.snackBar.open('Failed to update plugin settings', 'Close', { duration: 3000 });
      }
    });
  }

  refreshSettings() {
    this.loadSettings();
    this.loadPlugins();
    this.loadRoles();
  }
}
