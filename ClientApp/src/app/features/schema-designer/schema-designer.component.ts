import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '@core/services/api.service';
import { 
  Schema, 
  Collection, 
  Field, 
  FieldType,
  RelationType
} from '@core/models/schema.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-schema-designer',
  templateUrl: './schema-designer.component.html',
  styleUrls: ['./schema-designer.component.scss']
})
export class SchemaDesignerComponent implements OnInit {
  schemas: Schema[] = [];
  selectedSchema: Schema | null = null;
  selectedCollection: Collection | null = null;
  loadingSchemas = false;
  
  // Forms
  schemaForm: FormGroup;
  collectionForm: FormGroup;
  fieldForm: FormGroup;
  
  // Field options
  fieldTypes = Object.values(FieldType);
  relationTypes = Object.values(RelationType);
  
  // UI state
  showNewSchemaForm = false;
  showNewCollectionForm = false;
  showNewFieldForm = false;
  editMode = false;
  currentEditId: string | null = null;
  
  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    // Initialize forms
    this.schemaForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-z0-9_]+$/)]],
      displayName: ['', Validators.required],
      description: ['']
    });
    
    this.collectionForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-z0-9_]+$/)]],
      displayName: ['', Validators.required],
      description: [''],
      timestamps: [true]
    });
    
    this.fieldForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-z0-9_]+$/)]],
      displayName: ['', Validators.required],
      description: [''],
      type: [FieldType.String, Validators.required],
      required: [false],
      unique: [false],
      defaultValue: [''],
      relationType: [RelationType.OneToOne],
      targetCollection: [''],
      options: [''] // For enum type, comma separated values
    });
  }

  ngOnInit() {
    this.loadSchemas();
  }

  loadSchemas() {
    this.loadingSchemas = true;
    this.apiService.getSchemas().subscribe({
      next: (schemas) => {
        this.schemas = schemas;
        this.loadingSchemas = false;
        
        // Select the first schema if none is selected
        if (this.schemas.length > 0 && !this.selectedSchema) {
          this.selectSchema(this.schemas[0]);
        }
      },
      error: (error) => {
        console.error('Error loading schemas', error);
        this.loadingSchemas = false;
        this.snackBar.open('Failed to load schemas', 'Close', { duration: 3000 });
      }
    });
  }

  selectSchema(schema: Schema) {
    this.selectedSchema = schema;
    this.selectedCollection = null;
    this.resetForms();
  }

  selectCollection(collection: Collection) {
    this.selectedCollection = collection;
    this.resetForms();
  }

  // Schema CRUD operations
  createSchema() {
    if (this.schemaForm.invalid) return;
    
    const newSchema = {
      ...this.schemaForm.value,
      collections: []
    };
    
    this.apiService.createSchema(newSchema).subscribe({
      next: (schema) => {
        this.schemas.push(schema);
        this.selectSchema(schema);
        this.showNewSchemaForm = false;
        this.schemaForm.reset();
        this.snackBar.open('Schema created successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error creating schema', error);
        this.snackBar.open('Failed to create schema', 'Close', { duration: 3000 });
      }
    });
  }

  updateSchema() {
    if (this.schemaForm.invalid || !this.selectedSchema) return;
    
    const updatedSchema = {
      ...this.selectedSchema,
      ...this.schemaForm.value
    };
    
    this.apiService.updateSchema(this.selectedSchema.id, updatedSchema).subscribe({
      next: (schema) => {
        const index = this.schemas.findIndex(s => s.id === schema.id);
        if (index !== -1) {
          this.schemas[index] = schema;
        }
        this.selectSchema(schema);
        this.editMode = false;
        this.snackBar.open('Schema updated successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating schema', error);
        this.snackBar.open('Failed to update schema', 'Close', { duration: 3000 });
      }
    });
  }

  deleteSchema(schema: Schema) {
    // In a real app, you'd show a confirmation dialog
    if (!confirm(`Are you sure you want to delete schema "${schema.displayName}"?`)) return;
    
    this.apiService.deleteSchema(schema.id).subscribe({
      next: () => {
        this.schemas = this.schemas.filter(s => s.id !== schema.id);
        if (this.selectedSchema?.id === schema.id) {
          this.selectedSchema = this.schemas.length > 0 ? this.schemas[0] : null;
          this.selectedCollection = null;
        }
        this.snackBar.open('Schema deleted successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error deleting schema', error);
        this.snackBar.open('Failed to delete schema', 'Close', { duration: 3000 });
      }
    });
  }

  // Collection CRUD operations
  createCollection() {
    if (this.collectionForm.invalid || !this.selectedSchema) return;
    
    const newCollection: Partial<Collection> = {
      ...this.collectionForm.value,
      fields: []
    };
    
    this.apiService.createCollection(this.selectedSchema.id, newCollection).subscribe({
      next: (collection) => {
        if (this.selectedSchema) {
          this.selectedSchema.collections.push(collection);
          this.selectCollection(collection);
        }
        this.showNewCollectionForm = false;
        this.collectionForm.reset();
        this.snackBar.open('Collection created successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error creating collection', error);
        this.snackBar.open('Failed to create collection', 'Close', { duration: 3000 });
      }
    });
  }

  updateCollection() {
    if (this.collectionForm.invalid || !this.selectedSchema || !this.selectedCollection) return;
    
    const updatedCollection = {
      ...this.selectedCollection,
      ...this.collectionForm.value
    };
    
    this.apiService.updateCollection(this.selectedSchema.id, this.selectedCollection.id, updatedCollection).subscribe({
      next: (collection) => {
        if (this.selectedSchema) {
          const index = this.selectedSchema.collections.findIndex(c => c.id === collection.id);
          if (index !== -1) {
            this.selectedSchema.collections[index] = collection;
          }
        }
        this.selectCollection(collection);
        this.editMode = false;
        this.snackBar.open('Collection updated successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating collection', error);
        this.snackBar.open('Failed to update collection', 'Close', { duration: 3000 });
      }
    });
  }

  deleteCollection(collection: Collection) {
    // In a real app, you'd show a confirmation dialog
    if (!confirm(`Are you sure you want to delete collection "${collection.displayName}"?`)) return;
    
    if (!this.selectedSchema) return;
    
    this.apiService.deleteCollection(this.selectedSchema.id, collection.id).subscribe({
      next: () => {
        if (this.selectedSchema) {
          this.selectedSchema.collections = this.selectedSchema.collections.filter(c => c.id !== collection.id);
        }
        if (this.selectedCollection?.id === collection.id) {
          this.selectedCollection = null;
        }
        this.snackBar.open('Collection deleted successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error deleting collection', error);
        this.snackBar.open('Failed to delete collection', 'Close', { duration: 3000 });
      }
    });
  }

  // Field operations
  addField() {
    if (this.fieldForm.invalid || !this.selectedCollection) return;
    
    // Process field data
    const fieldData = this.processFieldFormData();
    
    // In a real app, you'd call an API to add the field
    // For now, just adding it to the local collection
    const newField: Field = {
      id: `field_${Date.now()}`, // In a real app, the server would generate an ID
      ...fieldData
    };
    
    this.selectedCollection.fields.push(newField);
    this.showNewFieldForm = false;
    this.fieldForm.reset();
    this.fieldForm.patchValue({ type: FieldType.String });
    this.snackBar.open('Field added successfully', 'Close', { duration: 3000 });
  }

  editField(field: Field) {
    this.showNewFieldForm = true;
    this.editMode = true;
    this.currentEditId = field.id;
    
    // Populate the form with field data
    this.fieldForm.patchValue({
      name: field.name,
      displayName: field.displayName,
      description: field.description || '',
      type: field.type,
      required: field.required,
      unique: field.unique,
      defaultValue: field.defaultValue || '',
      // Handle relation fields
      ...(field.type === FieldType.Relation && 'relationType' in field 
          ? { 
              relationType: field.relationType,
              targetCollection: field.targetCollection
            } 
          : {}),
      // Handle enum fields
      ...(field.type === FieldType.Enum && field.options 
          ? { options: field.options.map(o => o.value).join(',') } 
          : { options: '' })
    });
  }

  updateField() {
    if (this.fieldForm.invalid || !this.selectedCollection || !this.currentEditId) return;
    
    // Process field data
    const fieldData = this.processFieldFormData();
    
    // Find the field to update
    const index = this.selectedCollection.fields.findIndex(f => f.id === this.currentEditId);
    if (index !== -1) {
      this.selectedCollection.fields[index] = {
        ...this.selectedCollection.fields[index],
        ...fieldData
      };
    }
    
    this.showNewFieldForm = false;
    this.editMode = false;
    this.currentEditId = null;
    this.fieldForm.reset();
    this.fieldForm.patchValue({ type: FieldType.String });
    this.snackBar.open('Field updated successfully', 'Close', { duration: 3000 });
  }

  deleteField(field: Field) {
    // In a real app, you'd show a confirmation dialog
    if (!confirm(`Are you sure you want to delete field "${field.displayName}"?`)) return;
    
    if (!this.selectedCollection) return;
    
    // Remove the field from the collection
    this.selectedCollection.fields = this.selectedCollection.fields.filter(f => f.id !== field.id);
    this.snackBar.open('Field deleted successfully', 'Close', { duration: 3000 });
  }

  // Helper methods
  resetForms() {
    this.showNewSchemaForm = false;
    this.showNewCollectionForm = false;
    this.showNewFieldForm = false;
    this.editMode = false;
    this.currentEditId = null;
    
    this.schemaForm.reset();
    this.collectionForm.reset();
    this.fieldForm.reset();
    this.fieldForm.patchValue({ type: FieldType.String });
  }

  processFieldFormData(): Partial<Field> {
    const fieldData = { ...this.fieldForm.value };
    
    // Process enum options
    if (fieldData.type === FieldType.Enum && fieldData.options) {
      const options = fieldData.options.split(',').map((opt: string) => ({
        label: opt.trim(),
        value: opt.trim()
      }));
      fieldData.options = options;
    } else {
      delete fieldData.options;
    }
    
    // Process relation fields
    if (fieldData.type === FieldType.Relation) {
      fieldData.relationType = fieldData.relationType || RelationType.OneToOne;
      fieldData.targetCollection = fieldData.targetCollection;
    } else {
      delete fieldData.relationType;
      delete fieldData.targetCollection;
    }
    
    return fieldData;
  }

  onFieldDrop(event: CdkDragDrop<Field[]>) {
    if (!this.selectedCollection) return;
    
    moveItemInArray(
      this.selectedCollection.fields,
      event.previousIndex,
      event.currentIndex
    );
  }

  cancelForm() {
    this.resetForms();
  }

  refreshSchemas() {
    this.loadSchemas();
  }
}
