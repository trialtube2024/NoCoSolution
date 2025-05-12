import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '@core/services/api.service';
import { Schema, Collection, Field } from '@core/models/schema.model';

@Component({
  selector: 'app-data-explorer',
  templateUrl: './data-explorer.component.html',
  styleUrls: ['./data-explorer.component.scss']
})
export class DataExplorerComponent implements OnInit {
  // Data sources
  schemas: Schema[] = [];
  collections: Collection[] = [];
  
  // Selected items
  selectedSchema: Schema | null = null;
  selectedCollection: Collection | null = null;
  
  // Table data
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  displayedColumns: string[] = [];
  
  // Record form
  recordForm: FormGroup;
  
  // UI state
  loading = false;
  showRecordForm = false;
  editMode = false;
  currentRecordId: string | null = null;
  
  // Filters
  filterForm: FormGroup;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.recordForm = this.fb.group({});
    this.filterForm = this.fb.group({
      searchTerm: ['']
    });
  }

  ngOnInit() {
    this.loadSchemas();
  }

  loadSchemas() {
    this.loading = true;
    this.apiService.getSchemas().subscribe({
      next: (schemas) => {
        this.schemas = schemas;
        
        // Flatten collections from all schemas
        this.collections = schemas.flatMap(schema => schema.collections);
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading schemas', error);
        this.loading = false;
        this.snackBar.open('Failed to load schemas', 'Close', { duration: 3000 });
      }
    });
  }

  selectCollection(collection: Collection) {
    this.selectedCollection = collection;
    
    // Find parent schema
    this.selectedSchema = this.schemas.find(schema => 
      schema.collections.some(c => c.id === collection.id)
    ) || null;
    
    // Setup displayed columns
    this.setupDisplayedColumns(collection);
    
    // Load data
    this.loadData();
  }

  setupDisplayedColumns(collection: Collection) {
    // Always include id and action columns
    this.displayedColumns = ['id'];
    
    // Add columns for each field
    collection.fields.forEach(field => {
      // Skip complex fields like JSON, relations, etc.
      if (!['json', 'relation', 'file', 'image'].includes(field.type)) {
        this.displayedColumns.push(field.name);
      }
    });
    
    // Add timestamps if enabled
    if (collection.timestamps) {
      this.displayedColumns.push('createdAt');
      this.displayedColumns.push('updatedAt');
    }
    
    // Add actions column
    this.displayedColumns.push('actions');
  }

  loadData() {
    if (!this.selectedCollection) return;
    
    this.loading = true;
    
    // Get filter params
    const params: any = {};
    if (this.filterForm.value.searchTerm) {
      params.search = this.filterForm.value.searchTerm;
    }
    
    this.apiService.getData(this.selectedCollection.name, params).subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading data', error);
        this.loading = false;
        this.snackBar.open('Failed to load data', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilter() {
    this.loadData();
  }

  resetFilter() {
    this.filterForm.reset();
    this.loadData();
  }

  createRecord() {
    if (!this.selectedCollection) return;
    
    // Create a new form with controls for each field
    const formGroup: any = {};
    
    this.selectedCollection.fields.forEach(field => {
      // Add form control with validators
      formGroup[field.name] = [
        field.defaultValue || '', 
        field.required ? Validators.required : null
      ];
    });
    
    this.recordForm = this.fb.group(formGroup);
    this.showRecordForm = true;
    this.editMode = false;
    this.currentRecordId = null;
  }

  editRecord(record: any) {
    if (!this.selectedCollection) return;
    
    // Create a form with controls for each field
    const formGroup: any = {};
    
    this.selectedCollection.fields.forEach(field => {
      // Add form control with validators and current value
      formGroup[field.name] = [
        record[field.name] || field.defaultValue || '', 
        field.required ? Validators.required : null
      ];
    });
    
    this.recordForm = this.fb.group(formGroup);
    this.showRecordForm = true;
    this.editMode = true;
    this.currentRecordId = record.id;
  }

  saveRecord() {
    if (!this.selectedCollection || this.recordForm.invalid) return;
    
    const formData = this.recordForm.value;
    
    if (this.editMode && this.currentRecordId) {
      // Update existing record
      this.apiService.updateData(this.selectedCollection.name, this.currentRecordId, formData).subscribe({
        next: () => {
          this.loadData();
          this.showRecordForm = false;
          this.snackBar.open('Record updated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error updating record', error);
          this.snackBar.open('Failed to update record', 'Close', { duration: 3000 });
        }
      });
    } else {
      // Create new record
      this.apiService.createData(this.selectedCollection.name, formData).subscribe({
        next: () => {
          this.loadData();
          this.showRecordForm = false;
          this.snackBar.open('Record created successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error creating record', error);
          this.snackBar.open('Failed to create record', 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteRecord(record: any) {
    if (!this.selectedCollection) return;
    
    // In a real app, show a confirmation dialog
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    this.apiService.deleteData(this.selectedCollection.name, record.id).subscribe({
      next: () => {
        this.loadData();
        this.snackBar.open('Record deleted successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error deleting record', error);
        this.snackBar.open('Failed to delete record', 'Close', { duration: 3000 });
      }
    });
  }

  cancelRecordEdit() {
    this.showRecordForm = false;
    this.editMode = false;
    this.currentRecordId = null;
  }

  getFieldByName(name: string): Field | undefined {
    return this.selectedCollection?.fields.find(field => field.name === name);
  }

  getFieldDisplayValue(record: any, fieldName: string): string {
    if (!record || record[fieldName] === undefined || record[fieldName] === null) {
      return '';
    }
    
    const field = this.getFieldByName(fieldName);
    if (!field) return String(record[fieldName]);
    
    // Format based on field type
    switch (field.type) {
      case 'date':
        return new Date(record[fieldName]).toLocaleDateString();
      case 'datetime':
        return new Date(record[fieldName]).toLocaleString();
      case 'boolean':
        return record[fieldName] ? 'Yes' : 'No';
      default:
        return String(record[fieldName]);
    }
  }

  refreshData() {
    this.loadData();
  }
}
