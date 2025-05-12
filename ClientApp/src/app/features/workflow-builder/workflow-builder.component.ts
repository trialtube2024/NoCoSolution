import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '@core/services/api.service';
import { 
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  WorkflowTrigger,
  Schema,
  Collection
} from '@core/models/schema.model';

@Component({
  selector: 'app-workflow-builder',
  templateUrl: './workflow-builder.component.html',
  styleUrls: ['./workflow-builder.component.scss']
})
export class WorkflowBuilderComponent implements OnInit {
  // Data
  workflows: Workflow[] = [];
  schemas: Schema[] = [];
  collections: Collection[] = [];
  
  // Selected items
  selectedWorkflow: Workflow | null = null;
  
  // Workflow nodes and edges
  nodes: WorkflowNode[] = [];
  edges: WorkflowEdge[] = [];
  
  // Available node types
  nodeTypes = [
    { type: 'trigger', name: 'Trigger', icon: 'play_circle' },
    { type: 'condition', name: 'Condition', icon: 'call_split' },
    { type: 'action', name: 'Action', icon: 'flash_on' },
    { type: 'delay', name: 'Delay', icon: 'hourglass_empty' },
    { type: 'loop', name: 'Loop', icon: 'loop' },
    { type: 'end', name: 'End', icon: 'stop_circle' }
  ];
  
  // Trigger types
  triggerTypes = [
    { type: 'event', name: 'Event Based' },
    { type: 'schedule', name: 'Scheduled' },
    { type: 'webhook', name: 'Webhook' },
    { type: 'manual', name: 'Manual Execution' }
  ];
  
  // UI state
  loading = false;
  showWorkflowDetails = false;
  editMode = false;
  showNodeEditor = false;
  selectedNode: WorkflowNode | null = null;
  
  // Forms
  workflowForm: FormGroup;
  nodeForm: FormGroup;
  
  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.workflowForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-z0-9_]+$/)]],
      displayName: ['', Validators.required],
      description: [''],
      triggerType: ['event', Validators.required],
      active: [true]
    });
    
    this.nodeForm = this.fb.group({
      type: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      config: this.fb.group({
        // Dynamic config fields will be added based on node type
      })
    });
  }

  ngOnInit() {
    this.loadWorkflows();
    this.loadSchemas();
  }

  loadWorkflows() {
    this.loading = true;
    this.apiService.getWorkflows().subscribe({
      next: (workflows) => {
        this.workflows = workflows;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading workflows', error);
        this.loading = false;
        this.snackBar.open('Failed to load workflows', 'Close', { duration: 3000 });
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

  selectWorkflow(workflow: Workflow) {
    this.selectedWorkflow = workflow;
    this.nodes = workflow.nodes;
    this.edges = workflow.edges;
    
    // Reset UI state
    this.showWorkflowDetails = false;
    this.editMode = false;
    this.showNodeEditor = false;
    this.selectedNode = null;
  }

  createNewWorkflow() {
    this.selectedWorkflow = null;
    this.nodes = [];
    this.edges = [];
    
    // Add initial trigger node
    const triggerNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: 'trigger',
      position: { x: 100, y: 100 },
      data: {
        name: 'Start',
        description: 'Workflow start point',
        triggerType: 'event',
        config: {}
      }
    };
    
    this.nodes.push(triggerNode);
    
    this.showWorkflowDetails = true;
    this.editMode = false;
    this.workflowForm.reset();
    this.workflowForm.patchValue({
      triggerType: 'event',
      active: true
    });
  }

  addNode(type: string) {
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: type,
      position: { 
        x: this.nodes.length > 0 ? this.nodes[this.nodes.length - 1].position.x + 200 : 100, 
        y: this.nodes.length > 0 ? this.nodes[this.nodes.length - 1].position.y : 100 
      },
      data: {
        name: `New ${type}`,
        description: '',
        config: {}
      }
    };
    
    this.nodes.push(newNode);
    this.showNodeEditor = true;
    this.selectedNode = newNode;
    
    // Setup node form
    this.setupNodeForm(newNode);
  }

  setupNodeForm(node: WorkflowNode) {
    this.nodeForm.patchValue({
      type: node.type,
      name: node.data.name,
      description: node.data.description
    });
    
    // Clear previous config controls
    const configGroup = this.nodeForm.get('config') as FormGroup;
    
    // Add config fields based on node type
    switch (node.type) {
      case 'trigger':
        configGroup.addControl('triggerType', this.fb.control(node.data.triggerType || 'event'));
        
        if (node.data.triggerType === 'schedule') {
          configGroup.addControl('schedule', this.fb.control(node.data.config?.schedule || '0 0 * * *'));
        } else if (node.data.triggerType === 'event') {
          configGroup.addControl('collection', this.fb.control(node.data.config?.collection || ''));
          configGroup.addControl('event', this.fb.control(node.data.config?.event || 'create'));
        }
        break;
        
      case 'condition':
        configGroup.addControl('condition', this.fb.control(node.data.config?.condition || ''));
        break;
        
      case 'action':
        configGroup.addControl('actionType', this.fb.control(node.data.config?.actionType || 'create'));
        configGroup.addControl('collection', this.fb.control(node.data.config?.collection || ''));
        configGroup.addControl('data', this.fb.control(node.data.config?.data || '{}'));
        break;
        
      case 'delay':
        configGroup.addControl('duration', this.fb.control(node.data.config?.duration || 60));
        configGroup.addControl('durationType', this.fb.control(node.data.config?.durationType || 'seconds'));
        break;
        
      case 'loop':
        configGroup.addControl('items', this.fb.control(node.data.config?.items || ''));
        configGroup.addControl('variableName', this.fb.control(node.data.config?.variableName || 'item'));
        break;
    }
  }

  saveNode() {
    if (this.nodeForm.invalid || !this.selectedNode) return;
    
    const formValue = this.nodeForm.value;
    
    // Update selected node
    this.selectedNode.data = {
      name: formValue.name,
      description: formValue.description,
      config: formValue.config
    };
    
    // For trigger nodes, update the trigger type
    if (this.selectedNode.type === 'trigger') {
      this.selectedNode.data.triggerType = formValue.config.triggerType;
    }
    
    this.showNodeEditor = false;
    this.selectedNode = null;
  }

  addEdge(source: string, target: string, label: string = '') {
    const newEdge: WorkflowEdge = {
      id: `edge_${Date.now()}`,
      source,
      target,
      label
    };
    
    this.edges.push(newEdge);
  }

  deleteNode(node: WorkflowNode) {
    // Remove node
    this.nodes = this.nodes.filter(n => n.id !== node.id);
    
    // Remove associated edges
    this.edges = this.edges.filter(e => e.source !== node.id && e.target !== node.id);
    
    if (this.selectedNode?.id === node.id) {
      this.showNodeEditor = false;
      this.selectedNode = null;
    }
  }

  deleteEdge(edge: WorkflowEdge) {
    this.edges = this.edges.filter(e => e.id !== edge.id);
  }

  saveWorkflow() {
    if (this.workflowForm.invalid) return;
    
    const formValue = this.workflowForm.value;
    
    // Create trigger object based on form values
    const trigger: WorkflowTrigger = {
      type: formValue.triggerType,
      config: {}
    };
    
    // Add additional config based on trigger type
    if (formValue.triggerType === 'schedule') {
      trigger.config.schedule = '0 0 * * *'; // Default: daily at midnight
    }
    
    const workflow: Partial<Workflow> = {
      name: formValue.name,
      displayName: formValue.displayName,
      description: formValue.description,
      trigger,
      nodes: this.nodes,
      edges: this.edges,
      active: formValue.active
    };
    
    if (this.editMode && this.selectedWorkflow) {
      // Update existing workflow
      this.apiService.updateWorkflow(this.selectedWorkflow.id, workflow).subscribe({
        next: (updatedWorkflow) => {
          const index = this.workflows.findIndex(w => w.id === updatedWorkflow.id);
          if (index !== -1) {
            this.workflows[index] = updatedWorkflow;
          }
          this.selectWorkflow(updatedWorkflow);
          this.snackBar.open('Workflow updated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error updating workflow', error);
          this.snackBar.open('Failed to update workflow', 'Close', { duration: 3000 });
        }
      });
    } else {
      // Create new workflow
      this.apiService.createWorkflow(workflow).subscribe({
        next: (newWorkflow) => {
          this.workflows.push(newWorkflow);
          this.selectWorkflow(newWorkflow);
          this.snackBar.open('Workflow created successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error creating workflow', error);
          this.snackBar.open('Failed to create workflow', 'Close', { duration: 3000 });
        }
      });
    }
  }

  editWorkflow(workflow: Workflow) {
    this.selectWorkflow(workflow);
    this.workflowForm.patchValue({
      name: workflow.name,
      displayName: workflow.displayName,
      description: workflow.description || '',
      triggerType: workflow.trigger.type,
      active: workflow.active
    });
    this.showWorkflowDetails = true;
    this.editMode = true;
  }

  deleteWorkflow(workflow: Workflow) {
    // In a real app, show a confirmation dialog
    if (!confirm(`Are you sure you want to delete the workflow "${workflow.displayName}"?`)) return;
    
    this.apiService.deleteWorkflow(workflow.id).subscribe({
      next: () => {
        this.workflows = this.workflows.filter(w => w.id !== workflow.id);
        if (this.selectedWorkflow?.id === workflow.id) {
          this.selectedWorkflow = null;
        }
        this.snackBar.open('Workflow deleted successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error deleting workflow', error);
        this.snackBar.open('Failed to delete workflow', 'Close', { duration: 3000 });
      }
    });
  }

  toggleWorkflowState(workflow: Workflow) {
    const updatedWorkflow = { ...workflow, active: !workflow.active };
    
    this.apiService.updateWorkflow(workflow.id, updatedWorkflow).subscribe({
      next: (updated) => {
        const index = this.workflows.findIndex(w => w.id === updated.id);
        if (index !== -1) {
          this.workflows[index] = updated;
        }
        
        if (this.selectedWorkflow?.id === updated.id) {
          this.selectedWorkflow = updated;
        }
        
        this.snackBar.open(`Workflow ${updated.active ? 'enabled' : 'disabled'} successfully`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating workflow state', error);
        this.snackBar.open('Failed to update workflow state', 'Close', { duration: 3000 });
      }
    });
  }

  cancelWorkflowEdit() {
    this.showWorkflowDetails = false;
    if (this.selectedWorkflow) {
      this.selectWorkflow(this.selectedWorkflow);
    } else {
      this.nodes = [];
      this.edges = [];
    }
  }

  cancelNodeEdit() {
    this.showNodeEditor = false;
    this.selectedNode = null;
  }

  editNode(node: WorkflowNode) {
    this.selectedNode = node;
    this.showNodeEditor = true;
    this.setupNodeForm(node);
  }

  getNodeTypeIcon(type: string): string {
    const nodeType = this.nodeTypes.find(nt => nt.type === type);
    return nodeType ? nodeType.icon : 'circle';
  }

  getNodeTypeName(type: string): string {
    const nodeType = this.nodeTypes.find(nt => nt.type === type);
    return nodeType ? nodeType.name : type;
  }
}
