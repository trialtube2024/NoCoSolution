import { useState } from "react";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Plus, 
  GitBranch, 
  Play, 
  Pause, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight,
  Trash2,
  Settings,
  Edit,
  Copy,
  ExternalLink
} from "lucide-react";

// Mock data for workflows (normally would come from API)
const mockWorkflows = [
  {
    id: "1",
    name: "new_user_onboarding",
    displayName: "New User Onboarding",
    description: "Sends welcome email and creates default resources when a new user signs up",
    trigger: {
      type: "collection",
      collection: "users",
      event: "create"
    },
    active: true,
    steps: [
      {
        id: "1",
        type: "condition",
        name: "Check User Role",
        config: {
          field: "role",
          operator: "equals",
          value: "customer"
        }
      },
      {
        id: "2",
        type: "action",
        name: "Send Welcome Email",
        config: {
          action: "sendEmail",
          template: "welcome_email",
          recipient: "{{email}}"
        }
      },
      {
        id: "3",
        type: "action",
        name: "Create Default Folder",
        config: {
          action: "createRecord",
          collection: "folders",
          data: {
            name: "My First Folder",
            owner: "{{id}}",
            type: "default"
          }
        }
      }
    ],
    createdAt: "2023-05-15T10:00:00Z",
    updatedAt: "2023-05-15T10:00:00Z",
    executions: [
      {
        id: "1",
        status: "completed",
        startedAt: "2023-05-16T14:23:45Z",
        completedAt: "2023-05-16T14:23:48Z",
        steps: [
          { id: "1", status: "completed", result: true },
          { id: "2", status: "completed", result: { success: true } },
          { id: "3", status: "completed", result: { id: "folder-123" } }
        ]
      },
      {
        id: "2",
        status: "completed",
        startedAt: "2023-05-17T09:12:33Z",
        completedAt: "2023-05-17T09:12:37Z",
        steps: [
          { id: "1", status: "completed", result: true },
          { id: "2", status: "completed", result: { success: true } },
          { id: "3", status: "completed", result: { id: "folder-456" } }
        ]
      }
    ]
  },
  {
    id: "2",
    name: "order_processing",
    displayName: "Order Processing",
    description: "Processes new orders by updating inventory and sending confirmation",
    trigger: {
      type: "collection",
      collection: "orders",
      event: "create"
    },
    active: true,
    steps: [
      {
        id: "1",
        type: "action",
        name: "Update Inventory",
        config: {
          action: "custom",
          function: "updateInventory",
          params: {
            orderId: "{{id}}"
          }
        }
      },
      {
        id: "2",
        type: "condition",
        name: "Check Payment Status",
        config: {
          field: "payment_status",
          operator: "equals",
          value: "paid"
        }
      },
      {
        id: "3",
        type: "action",
        name: "Send Order Confirmation",
        config: {
          action: "sendEmail",
          template: "order_confirmation",
          recipient: "{{customer.email}}"
        }
      }
    ],
    createdAt: "2023-06-01T15:30:00Z",
    updatedAt: "2023-06-01T15:30:00Z",
    executions: [
      {
        id: "1",
        status: "completed",
        startedAt: "2023-06-02T11:45:22Z",
        completedAt: "2023-06-02T11:45:26Z",
        steps: [
          { id: "1", status: "completed", result: { success: true } },
          { id: "2", status: "completed", result: true },
          { id: "3", status: "completed", result: { success: true } }
        ]
      },
      {
        id: "2",
        status: "failed",
        startedAt: "2023-06-03T14:22:10Z",
        completedAt: "2023-06-03T14:22:12Z",
        error: "Failed to update inventory: Product not found",
        steps: [
          { id: "1", status: "failed", error: "Product not found", result: null },
          { id: "2", status: "skipped" },
          { id: "3", status: "skipped" }
        ]
      }
    ]
  }
];

// Trigger types
const triggerTypes = [
  { value: "collection", label: "Collection Event" },
  { value: "schedule", label: "Schedule" },
  { value: "webhook", label: "Webhook" },
  { value: "manual", label: "Manual Trigger" }
];

// Collection event types
const collectionEvents = [
  { value: "create", label: "Record Created" },
  { value: "update", label: "Record Updated" },
  { value: "delete", label: "Record Deleted" }
];

// Step types
const stepTypes = [
  { value: "action", label: "Action" },
  { value: "condition", label: "Condition" },
  { value: "loop", label: "Loop" },
  { value: "delay", label: "Delay" }
];

// Action types
const actionTypes = [
  { value: "createRecord", label: "Create Record" },
  { value: "updateRecord", label: "Update Record" },
  { value: "deleteRecord", label: "Delete Record" },
  { value: "sendEmail", label: "Send Email" },
  { value: "httpRequest", label: "HTTP Request" },
  { value: "custom", label: "Custom Function" }
];

// Collections (normally would come from API)
const collections = [
  { value: "users", label: "Users" },
  { value: "products", label: "Products" },
  { value: "orders", label: "Orders" },
  { value: "folders", label: "Folders" }
];

export default function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState(mockWorkflows);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [selectedExecution, setSelectedExecution] = useState<any>(null);
  const [showAddWorkflow, setShowAddWorkflow] = useState(false);
  const [showAddStep, setShowAddStep] = useState(false);
  
  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    displayName: "",
    description: "",
    triggerType: "collection",
    triggerCollection: "",
    triggerEvent: "create"
  });
  
  const [newStep, setNewStep] = useState({
    type: "action",
    name: "",
    actionType: "createRecord",
    collection: "",
    condition: {
      field: "",
      operator: "equals",
      value: ""
    }
  });

  const handleSelectWorkflow = (workflow: any) => {
    setSelectedWorkflow(workflow);
    setSelectedExecution(null);
  };

  const handleToggleActive = (id: string, active: boolean) => {
    setWorkflows(workflows.map(workflow => 
      workflow.id === id ? { ...workflow, active } : workflow
    ));
    
    if (selectedWorkflow?.id === id) {
      setSelectedWorkflow({ ...selectedWorkflow, active });
    }
  };

  const handleAddWorkflow = () => {
    const workflow = {
      id: String(Date.now()),
      name: newWorkflow.name.toLowerCase().replace(/\s+/g, '_'),
      displayName: newWorkflow.displayName,
      description: newWorkflow.description,
      trigger: {
        type: newWorkflow.triggerType,
        collection: newWorkflow.triggerCollection,
        event: newWorkflow.triggerEvent
      },
      active: true,
      steps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executions: []
    };
    
    setWorkflows([...workflows, workflow]);
    setNewWorkflow({
      name: "",
      displayName: "",
      description: "",
      triggerType: "collection",
      triggerCollection: "",
      triggerEvent: "create"
    });
    setShowAddWorkflow(false);
  };

  const handleAddStep = () => {
    if (!selectedWorkflow) return;
    
    let stepConfig: any = {};
    
    if (newStep.type === 'action') {
      stepConfig = {
        action: newStep.actionType,
        collection: newStep.collection
      };
    } else if (newStep.type === 'condition') {
      stepConfig = newStep.condition;
    }
    
    const step = {
      id: String(Date.now()),
      type: newStep.type,
      name: newStep.name,
      config: stepConfig
    };
    
    const updatedWorkflow = {
      ...selectedWorkflow,
      steps: [...selectedWorkflow.steps, step],
      updatedAt: new Date().toISOString()
    };
    
    setWorkflows(workflows.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w));
    setSelectedWorkflow(updatedWorkflow);
    setNewStep({
      type: "action",
      name: "",
      actionType: "createRecord",
      collection: "",
      condition: {
        field: "",
        operator: "equals",
        value: ""
      }
    });
    setShowAddStep(false);
  };

  const renderTriggerInfo = (trigger: any) => {
    if (trigger.type === 'collection') {
      return (
        <div className="flex items-center text-sm">
          <Badge className="mr-2">{trigger.type}</Badge>
          When a record is {trigger.event}d in {trigger.collection}
        </div>
      );
    } else if (trigger.type === 'schedule') {
      return (
        <div className="flex items-center text-sm">
          <Badge className="mr-2">{trigger.type}</Badge>
          Runs on schedule: {trigger.schedule}
        </div>
      );
    } else if (trigger.type === 'webhook') {
      return (
        <div className="flex items-center text-sm">
          <Badge className="mr-2">{trigger.type}</Badge>
          Triggered via webhook
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-sm">
          <Badge className="mr-2">{trigger.type}</Badge>
          Manually triggered
        </div>
      );
    }
  };

  const renderExecutionStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center">
            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm">Completed</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-sm">Failed</span>
          </div>
        );
      case 'running':
        return (
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-blue-500 mr-1 animate-spin" />
            <span className="text-sm">Running</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <span className="text-sm">{status}</span>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Workflow Builder</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Workflows</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAddWorkflow(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {workflows.map(workflow => (
                <div key={workflow.id} className="flex items-center">
                  <Button 
                    variant={selectedWorkflow?.id === workflow.id ? "default" : "outline"}
                    className="w-full justify-start mr-2"
                    onClick={() => handleSelectWorkflow(workflow)}
                  >
                    <GitBranch className="mr-2 h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span>{workflow.displayName}</span>
                      <span className="text-xs text-muted-foreground">{renderTriggerInfo(workflow.trigger)}</span>
                    </div>
                  </Button>
                  <div className="flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(workflow.id, !workflow.active)}
                    >
                      {workflow.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          {selectedWorkflow ? (
            <>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <CardTitle>{selectedWorkflow.displayName}</CardTitle>
                      <Badge 
                        variant={selectedWorkflow.active ? "default" : "outline"}
                        className="ml-2"
                      >
                        {selectedWorkflow.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {selectedWorkflow.description}
                    </CardDescription>
                    <div className="mt-2">
                      {renderTriggerInfo(selectedWorkflow.trigger)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedWorkflow.active ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggleActive(selectedWorkflow.id, !selectedWorkflow.active)}
                    >
                      {selectedWorkflow.active ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Disable
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Enable
                        </>
                      )}
                    </Button>
                    {selectedExecution ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedExecution(null)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Workflow
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowAddStep(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Step
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedExecution ? (
                  // Execution details view
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <div>
                        <h3 className="font-medium">Execution Details</h3>
                        <p className="text-sm text-muted-foreground">
                          Execution ID: {selectedExecution.id}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {renderExecutionStatus(selectedExecution.status)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium">Started At</h4>
                          <p className="text-sm">{new Date(selectedExecution.startedAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Completed At</h4>
                          <p className="text-sm">{new Date(selectedExecution.completedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    {selectedExecution.error && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <h4 className="text-sm font-medium text-red-800">Error</h4>
                        <p className="text-sm text-red-700">{selectedExecution.error}</p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-medium mb-2">Execution Steps</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Step</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Result</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedExecution.steps.map((step: any, index: number) => {
                            const workflowStep = selectedWorkflow.steps.find((s: any) => s.id === step.id);
                            return (
                              <TableRow key={step.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{workflowStep?.name || `Step ${index + 1}`}</TableCell>
                                <TableCell>
                                  {step.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                  {step.status === 'failed' && <AlertCircle className="h-4 w-4 text-red-500" />}
                                  {step.status === 'skipped' && <Clock className="h-4 w-4 text-gray-500" />}
                                </TableCell>
                                <TableCell>
                                  {step.error ? (
                                    <span className="text-red-500">{step.error}</span>
                                  ) : step.result !== undefined ? (
                                    <code className="text-xs bg-muted p-1 rounded">
                                      {typeof step.result === 'object' 
                                        ? JSON.stringify(step.result) 
                                        : String(step.result)}
                                    </code>
                                  ) : null}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  // Workflow view
                  <Tabs defaultValue="steps">
                    <TabsList className="mb-4">
                      <TabsTrigger value="steps">
                        <Settings className="h-4 w-4 mr-2" />
                        Steps
                      </TabsTrigger>
                      <TabsTrigger value="executions">
                        <Clock className="h-4 w-4 mr-2" />
                        Execution History
                      </TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="steps">
                      <div className="space-y-4">
                        {selectedWorkflow.steps.length === 0 ? (
                          <div className="text-center py-8 border-2 border-dashed rounded-md">
                            <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-muted-foreground mb-2">No steps in this workflow yet</p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowAddStep(true)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add First Step
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {selectedWorkflow.steps.map((step: any, index: number) => (
                              <Card key={step.id}>
                                <CardHeader className="py-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-medium mr-2">
                                        {index + 1}
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium">{step.name}</h4>
                                        <p className="text-xs text-muted-foreground">
                                          {step.type === 'action' && `Action: ${step.config.action}`}
                                          {step.type === 'condition' && `Condition: ${step.config.field} ${step.config.operator} ${step.config.value}`}
                                          {step.type === 'loop' && 'Loop'}
                                          {step.type === 'delay' && 'Delay'}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex space-x-1">
                                      <Button variant="ghost" size="sm">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm">
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="executions">
                      <div className="space-y-4">
                        {selectedWorkflow.executions?.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Started</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedWorkflow.executions.map((execution: any) => {
                                const startDate = new Date(execution.startedAt);
                                const endDate = new Date(execution.completedAt);
                                const durationMs = endDate.getTime() - startDate.getTime();
                                const durationSec = Math.round(durationMs / 1000);
                                
                                return (
                                  <TableRow key={execution.id}>
                                    <TableCell>{execution.id}</TableCell>
                                    <TableCell>{renderExecutionStatus(execution.status)}</TableCell>
                                    <TableCell>{startDate.toLocaleString()}</TableCell>
                                    <TableCell>{durationSec}s</TableCell>
                                    <TableCell className="text-right">
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => setSelectedExecution(execution)}
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-8 border-2 border-dashed rounded-md">
                            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">No execution history available</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="settings">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Workflow Name</h3>
                          <Input value={selectedWorkflow.displayName} disabled />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Workflow ID</h3>
                          <Input value={selectedWorkflow.name} disabled />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Description</h3>
                          <Textarea value={selectedWorkflow.description} disabled />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Status</h3>
                          <div className="flex items-center">
                            <Switch 
                              checked={selectedWorkflow.active}
                              onCheckedChange={(checked) => handleToggleActive(selectedWorkflow.id, checked)}
                            />
                            <span className="ml-2">
                              {selectedWorkflow.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Trigger</h3>
                          <div className="p-2 bg-muted rounded">
                            {renderTriggerInfo(selectedWorkflow.trigger)}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Created At</h3>
                          <p>{new Date(selectedWorkflow.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Updated At</h3>
                          <p>{new Date(selectedWorkflow.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
              <GitBranch className="h-16 w-16 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Workflow Selected</h3>
              <p className="text-muted-foreground mb-4">
                Select a workflow from the list or create a new one.
              </p>
              <Button onClick={() => setShowAddWorkflow(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Workflow
              </Button>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Add Workflow Dialog */}
      <Dialog open={showAddWorkflow} onOpenChange={setShowAddWorkflow}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              Create an automated workflow with triggers and actions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="workflowDisplayName">Workflow Name</Label>
              <Input 
                id="workflowDisplayName" 
                placeholder="e.g. New User Onboarding" 
                value={newWorkflow.displayName}
                onChange={(e) => setNewWorkflow({...newWorkflow, displayName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workflowName">Technical Name</Label>
              <Input 
                id="workflowName" 
                placeholder="e.g. new_user_onboarding" 
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow({...newWorkflow, name: e.target.value})}
              />
              <p className="text-sm text-muted-foreground">
                Used for API endpoints and database references.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workflowDescription">Description</Label>
              <Textarea 
                id="workflowDescription" 
                placeholder="Briefly describe what this workflow does" 
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow({...newWorkflow, description: e.target.value})}
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Trigger</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="triggerType">Trigger Type</Label>
                  <Select 
                    value={newWorkflow.triggerType}
                    onValueChange={(value) => setNewWorkflow({...newWorkflow, triggerType: value})}
                  >
                    <SelectTrigger id="triggerType">
                      <SelectValue placeholder="Select trigger type" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {newWorkflow.triggerType === 'collection' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="triggerCollection">Collection</Label>
                      <Select 
                        value={newWorkflow.triggerCollection}
                        onValueChange={(value) => setNewWorkflow({...newWorkflow, triggerCollection: value})}
                      >
                        <SelectTrigger id="triggerCollection">
                          <SelectValue placeholder="Select collection" />
                        </SelectTrigger>
                        <SelectContent>
                          {collections.map(collection => (
                            <SelectItem key={collection.value} value={collection.value}>
                              {collection.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="triggerEvent">Event</Label>
                      <Select 
                        value={newWorkflow.triggerEvent}
                        onValueChange={(value) => setNewWorkflow({...newWorkflow, triggerEvent: value})}
                      >
                        <SelectTrigger id="triggerEvent">
                          <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                        <SelectContent>
                          {collectionEvents.map(event => (
                            <SelectItem key={event.value} value={event.value}>
                              {event.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                {newWorkflow.triggerType === 'schedule' && (
                  <div className="space-y-2">
                    <Label htmlFor="triggerSchedule">Schedule (CRON format)</Label>
                    <Input 
                      id="triggerSchedule" 
                      placeholder="e.g. 0 9 * * 1-5"
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: minute hour day-of-month month day-of-week
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddWorkflow(false)}>Cancel</Button>
            <Button onClick={handleAddWorkflow}>Create Workflow</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Step Dialog */}
      <Dialog open={showAddStep} onOpenChange={setShowAddStep}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Workflow Step</DialogTitle>
            <DialogDescription>
              Add a new step to the workflow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="stepName">Step Name</Label>
              <Input 
                id="stepName" 
                placeholder="e.g. Send Welcome Email" 
                value={newStep.name}
                onChange={(e) => setNewStep({...newStep, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stepType">Step Type</Label>
              <Select 
                value={newStep.type}
                onValueChange={(value) => setNewStep({...newStep, type: value})}
              >
                <SelectTrigger id="stepType">
                  <SelectValue placeholder="Select step type" />
                </SelectTrigger>
                <SelectContent>
                  {stepTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {newStep.type === 'action' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="actionType">Action Type</Label>
                  <Select 
                    value={newStep.actionType}
                    onValueChange={(value) => setNewStep({...newStep, actionType: value})}
                  >
                    <SelectTrigger id="actionType">
                      <SelectValue placeholder="Select action type" />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {['createRecord', 'updateRecord', 'deleteRecord'].includes(newStep.actionType) && (
                  <div className="space-y-2">
                    <Label htmlFor="actionCollection">Collection</Label>
                    <Select 
                      value={newStep.collection}
                      onValueChange={(value) => setNewStep({...newStep, collection: value})}
                    >
                      <SelectTrigger id="actionCollection">
                        <SelectValue placeholder="Select collection" />
                      </SelectTrigger>
                      <SelectContent>
                        {collections.map(collection => (
                          <SelectItem key={collection.value} value={collection.value}>
                            {collection.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
            
            {newStep.type === 'condition' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="conditionField">Field Name</Label>
                  <Input 
                    id="conditionField" 
                    placeholder="e.g. status" 
                    value={newStep.condition.field}
                    onChange={(e) => setNewStep({
                      ...newStep, 
                      condition: {...newStep.condition, field: e.target.value}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conditionOperator">Operator</Label>
                  <Select 
                    value={newStep.condition.operator}
                    onValueChange={(value) => setNewStep({
                      ...newStep, 
                      condition: {...newStep.condition, operator: value}
                    })}
                  >
                    <SelectTrigger id="conditionOperator">
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="notEquals">Not Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="greaterThan">Greater Than</SelectItem>
                      <SelectItem value="lessThan">Less Than</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conditionValue">Value</Label>
                  <Input 
                    id="conditionValue" 
                    placeholder="e.g. active" 
                    value={newStep.condition.value}
                    onChange={(e) => setNewStep({
                      ...newStep, 
                      condition: {...newStep.condition, value: e.target.value}
                    })}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStep(false)}>Cancel</Button>
            <Button onClick={handleAddStep}>Add Step</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}