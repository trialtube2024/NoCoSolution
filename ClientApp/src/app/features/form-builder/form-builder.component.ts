import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '@core/services/api.service';
import { 
  Schema, 
  Collection, 
  Field, 
  FormConfig, 
  FormField,
  FormAction,
  FormLayout
} from '@core/models/schema.model';

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent implements OnInit {
  // Data
  forms: FormConfig[] = [];
  schemas: Schema[] = [];
  collections: Collection[] = [];
  fields: Field[] = [];
  
  // Selected items
  selectedForm: FormConfig | null = null;
  selectedCollection: Collection | null = null;
  
  // Form builder state
  formFields: FormField[] = [];
  formActions: FormAction[] = [];
  
  // UI state
  loading = false;
  showFormDetails = false;
  editMode = false;
  
  // Forms
  formDetailsForm: FormGroup;
  actionForm: FormGroup;
  
  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.formDetailsForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-z0-9_]+$/)]],
      displayName: ['', Validators.required],
      description: [''],
      collection: ['', Validators.required]
    });
    
    this.actionForm = this.fb.group({
      type: ['submit', Validators.required],
      label: ['Submit', Validators.required],
      position: ['end', Validators.required],
      handler: [''],
      style: ['primary']
    });
  }

  ngOnInit() {
    this.loadForms();
    this.loadSchemas();
  }

  loadForms() {
    this.loading = true;
    this.apiService.getForms().subscribe({
      next: (forms) => {
        this.forms = forms;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading forms', error);
        this.loading = false;
        this.snackBar.open('Failed to load forms', 'Close', { duration: 3000 });
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

  selectForm(form: FormConfig) {
    this.selectedForm = form;
    
    // Find the corresponding collection
    const collection = this.collections.find(c => c.name === form.collection);
    if (collection) {
      this.selectedCollection = collection;
      this.fields = collection.fields;
    }
    
    // Load form fields and actions
    this.formFields = form.fields;
    this.formActions = form.actions;
    
    // Reset UI state
    this.showFormDetails = false;
    this.editMode = false;
  }

  createNewForm() {
    this.selectedForm = null;
    this.selectedCollection = null;
    this.formFields = [];
    this.formActions = [
      {
        id: `action_${Date.now()}`,
        type: 'submit',
        label: 'Submit',
        position: 'end',
        style: 'primary'
      },
      {
        id: `action_${Date.now() + 1}`,
        type: 'cancel',
        label: 'Cancel',
        position: 'end',
        style: 'secondary'
      }
    ];
    
    this.showFormDetails = true;
    this.editMode = false;
    this.formDetailsForm.reset();
  }

  onCollectionChange() {
    const collectionName = this.formDetailsForm.get('collection')?.value;
    if (collectionName) {
      this.selectedCollection = this.collections.find(c => c.name === collectionName) || null;
      if (this.selectedCollection) {
        this.fields = this.selectedCollection.fields;
        
        // Reset form fields when collection changes
        this.formFields = [];
      }
    }
  }

  addFieldToForm(field: Field) {
    // Check if field is already added
    if (this.formFields.some(f => f.fieldId === field.id)) {
      this.snackBar.open('Field already added to form', 'Close', { duration: 3000 });
      return;
    }
    
    // Add field to form
    const formField: FormField = {
      id: `form_field_${Date.now()}`,
      fieldId: field.id,
      layout: {
        x: 0,
        y: this.formFields.length,
        w: 12,
        h: 1
      },
      settings: {
        label: field.displayName,
        description: field.description,
        placeholder: '',
        disabled: false,
        hidden: false,
        defaultValue: field.defaultValue
      }
    };
    
    this.formFields.push(formField);
  }

  removeFieldFromForm(formField: FormField) {
    this.formFields = this.formFields.filter(f => f.id !== formField.id);
  }

  addAction() {
    if (this.actionForm.invalid) return;
    
    const action: FormAction = {
      id: `action_${Date.now()}`,
      ...this.actionForm.value
    };
    
    this.formActions.push(action);
    this.actionForm.reset();
    this.actionForm.patchValue({
      type: 'submit',
      position: 'end',
      style: 'primary'
    });
  }

  removeAction(action: FormAction) {
    this.formActions = this.formActions.filter(a => a.id !== action.id);
  }

  saveForm() {
    if (this.formDetailsForm.invalid || !this.selectedCollection) return;
    
    const formData = this.formDetailsForm.value;
    
    // Create form layout based on field positions
    const layout: FormLayout = {
      id: `layout_${Date.now()}`,
      type: 'grid',
      config: {
        columns: 12,
        gap: 16
      }
    };
    
    const form: Partial<FormConfig> = {
      ...formData,
      layouts: [layout],
      fields: this.formFields,
      actions: this.formActions
    };
    
    if (this.editMode && this.selectedForm) {
      // Update existing form
      this.apiService.updateForm(this.selectedForm.id, form).subscribe({
        next: (updatedForm) => {
          const index = this.forms.findIndex(f => f.id === updatedForm.id);
          if (index !== -1) {
            this.forms[index] = updatedForm;
          }
          this.selectForm(updatedForm);
          this.snackBar.open('Form updated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error updating form', error);
          this.snackBar.open('Failed to update form', 'Close', { duration: 3000 });
        }
      });
    } else {
      // Create new form
      this.apiService.createForm(form).subscribe({
        next: (newForm) => {
          this.forms.push(newForm);
          this.selectForm(newForm);
          this.snackBar.open('Form created successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error creating form', error);
          this.snackBar.open('Failed to create form', 'Close', { duration: 3000 });
        }
      });
    }
  }

  editForm(form: FormConfig) {
    this.selectForm(form);
    this.formDetailsForm.patchValue({
      name: form.name,
      displayName: form.displayName,
      description: form.description || '',
      collection: form.collection
    });
    this.showFormDetails = true;
    this.editMode = true;
  }

  deleteForm(form: FormConfig) {
    // In a real app, show a confirmation dialog
    if (!confirm(`Are you sure you want to delete the form "${form.displayName}"?`)) return;
    
    this.apiService.deleteForm(form.id).subscribe({
      next: () => {
        this.forms = this.forms.filter(f => f.id !== form.id);
        if (this.selectedForm?.id === form.id) {
          this.selectedForm = null;
        }
        this.snackBar.open('Form deleted successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error deleting form', error);
        this.snackBar.open('Failed to delete form', 'Close', { duration: 3000 });
      }
    });
  }

  // Field reordering
  onFieldDrop(event: CdkDragDrop<FormField[]>) {
    moveItemInArray(this.formFields, event.previousIndex, event.currentIndex);
    
    // Update y positions
    this.formFields.forEach((field, index) => {
      field.layout.y = index;
    });
  }

  // Action reordering
  onActionDrop(event: CdkDragDrop<FormAction[]>) {
    moveItemInArray(this.formActions, event.previousIndex, event.currentIndex);
  }

  getFieldById(fieldId: string): Field | undefined {
    return this.fields.find(f => f.id === fieldId);
  }

  cancelForm() {
    this.showFormDetails = false;
    if (this.selectedForm) {
      this.selectForm(this.selectedForm);
    } else {
      this.formFields = [];
      this.formActions = [];
    }
  }
}
