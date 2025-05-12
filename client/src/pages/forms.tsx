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
  DialogTitle, 
  DialogTrigger 
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "react-beautiful-dnd";
import { ArrowLeft, Plus, FormInput, Settings, Eye, Copy, Trash2, GripVertical, MoveVertical } from "lucide-react";

// Mock data for collections (normally would come from API)
const mockCollections = [
  { id: "1", name: "users", displayName: "Users" },
  { id: "2", name: "products", displayName: "Products" },
  { id: "3", name: "orders", displayName: "Orders" }
];

// Mock data for forms (normally would come from API)
const mockForms = [
  { 
    id: "1", 
    name: "user_registration", 
    displayName: "User Registration",
    description: "Register new system users",
    collection: "users",
    fields: [
      { id: "1", type: "text", label: "Full Name", name: "name", required: true, placeholder: "Enter your full name" },
      { id: "2", type: "email", label: "Email Address", name: "email", required: true, placeholder: "Enter your email" },
      { id: "3", type: "password", label: "Password", name: "password", required: true, placeholder: "Create a password" },
      { id: "4", type: "select", label: "Role", name: "role", required: true, options: ["admin", "user", "guest"] }
    ]
  },
  { 
    id: "2", 
    name: "product_create", 
    displayName: "Create Product",
    description: "Add new products to inventory",
    collection: "products",
    fields: [
      { id: "1", type: "text", label: "Product Name", name: "name", required: true, placeholder: "Enter product name" },
      { id: "2", type: "number", label: "Price", name: "price", required: true, placeholder: "Enter product price" },
      { id: "3", type: "textarea", label: "Description", name: "description", required: false, placeholder: "Enter product description" },
      { id: "4", type: "checkbox", label: "In Stock", name: "inStock", required: true }
    ]
  }
];

// Field type options
const fieldTypes = [
  { value: "text", label: "Text Input" },
  { value: "email", label: "Email Input" },
  { value: "password", label: "Password Input" },
  { value: "number", label: "Number Input" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Select Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio Button" },
  { value: "date", label: "Date Picker" }
];

export default function FormBuilder() {
  const [forms, setForms] = useState(mockForms);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  
  const [newForm, setNewForm] = useState({ 
    name: "", 
    displayName: "", 
    description: "",
    collection: ""
  });
  
  const [newField, setNewField] = useState({ 
    type: "text", 
    label: "", 
    name: "",
    required: false,
    placeholder: "",
    options: ""
  });

  const handleSelectForm = (form: any) => {
    setSelectedForm(form);
  };

  const handleAddForm = () => {
    const form = {
      id: String(Date.now()),
      name: newForm.name.toLowerCase().replace(/\s+/g, '_'),
      displayName: newForm.displayName,
      description: newForm.description,
      collection: newForm.collection,
      fields: []
    };
    
    setForms([...forms, form]);
    setNewForm({ name: "", displayName: "", description: "", collection: "" });
    setShowAddForm(false);
  };

  const handleAddField = () => {
    if (!selectedForm) return;
    
    const field = {
      id: String(Date.now()),
      type: newField.type,
      label: newField.label,
      name: newField.name.toLowerCase().replace(/\s+/g, '_'),
      required: newField.required,
      placeholder: newField.placeholder,
      options: newField.type === 'select' || newField.type === 'radio' 
        ? newField.options.split(',').map(o => o.trim()) 
        : undefined
    };
    
    const updatedForm = {
      ...selectedForm,
      fields: [...selectedForm.fields, field]
    };
    
    setForms(forms.map(f => f.id === selectedForm.id ? updatedForm : f));
    setSelectedForm(updatedForm);
    setNewField({ 
      type: "text", 
      label: "", 
      name: "",
      required: false,
      placeholder: "",
      options: ""
    });
    setShowAddField(false);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination || !selectedForm) return;
    
    const items = Array.from(selectedForm.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const updatedForm = {
      ...selectedForm,
      fields: items
    };
    
    setSelectedForm(updatedForm);
    setForms(forms.map(f => f.id === selectedForm.id ? updatedForm : f));
  };

  // Render form field for preview
  const renderField = (field: any) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <Input 
            type={field.type} 
            placeholder={field.placeholder} 
            disabled 
          />
        );
      case 'textarea':
        return <Textarea placeholder={field.placeholder} disabled />;
      case 'select':
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input type="checkbox" disabled className="h-4 w-4 rounded" />
          </div>
        );
      case 'radio':
        return (
          <div className="flex flex-col space-y-2">
            {field.options?.map((option: string) => (
              <div key={option} className="flex items-center">
                <input type="radio" disabled className="h-4 w-4 rounded-full" />
                <span className="ml-2 text-sm">{option}</span>
              </div>
            ))}
          </div>
        );
      case 'date':
        return <Input type="date" disabled />;
      default:
        return <Input disabled />;
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
        <h1 className="text-3xl font-bold">Form Builder</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Forms</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {forms.map(form => (
                <Button 
                  key={form.id}
                  variant={selectedForm?.id === form.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleSelectForm(form)}
                >
                  <FormInput className="mr-2 h-4 w-4" />
                  {form.displayName}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          {selectedForm ? (
            <>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedForm.displayName}</CardTitle>
                    <CardDescription>
                      {selectedForm.description} • Collection: {selectedForm.collection}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAddField(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Field
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="editor">
                  <TabsList className="mb-4">
                    <TabsTrigger value="editor">
                      <Settings className="h-4 w-4 mr-2" />
                      Editor
                    </TabsTrigger>
                    <TabsTrigger value="preview">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="json">JSON</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="editor">
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="form-fields">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-4"
                          >
                            {selectedForm.fields.length === 0 ? (
                              <div className="text-center py-8 border-2 border-dashed rounded-md">
                                <p className="text-muted-foreground mb-2">No fields added yet</p>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setShowAddField(true)}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add Field
                                </Button>
                              </div>
                            ) : (
                              selectedForm.fields.map((field: any, index: number) => (
                                <Draggable key={field.id} draggableId={field.id} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="border rounded-md p-4 bg-card"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div className="flex items-center">
                                          <div {...provided.dragHandleProps} className="mr-2 cursor-move">
                                            <MoveVertical className="h-5 w-5 text-muted-foreground" />
                                          </div>
                                          <div>
                                            <h4 className="font-medium text-sm">{field.label}</h4>
                                            <p className="text-xs text-muted-foreground">
                                              {field.type} • {field.name} • {field.required ? "Required" : "Optional"}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex space-x-1">
                                          <Button variant="ghost" size="sm">
                                            <Copy className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="sm">
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </TabsContent>
                  
                  <TabsContent value="preview">
                    <Card>
                      <CardHeader>
                        <CardTitle>{selectedForm.displayName}</CardTitle>
                        <CardDescription>{selectedForm.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {selectedForm.fields.map((field: any) => (
                            <div key={field.id} className="space-y-2">
                              <Label>
                                {field.label}
                                {field.required && <span className="text-destructive ml-1">*</span>}
                              </Label>
                              {renderField(field)}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">Submit</Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="json">
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
                      {JSON.stringify(selectedForm, null, 2)}
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
              <FormInput className="h-16 w-16 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Form Selected</h3>
              <p className="text-muted-foreground mb-4">
                Select a form from the left panel or create a new one.
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Form
              </Button>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Add Form Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
            <DialogDescription>
              Create a form to collect and submit data to a collection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="formDisplayName">Form Title</Label>
              <Input 
                id="formDisplayName" 
                placeholder="e.g. User Registration" 
                value={newForm.displayName}
                onChange={(e) => setNewForm({...newForm, displayName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="formName">Technical Name</Label>
              <Input 
                id="formName" 
                placeholder="e.g. user_registration" 
                value={newForm.name}
                onChange={(e) => setNewForm({...newForm, name: e.target.value})}
              />
              <p className="text-sm text-muted-foreground">
                Used for API endpoints and database references.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="formDescription">Description</Label>
              <Textarea 
                id="formDescription" 
                placeholder="Briefly describe the purpose of this form" 
                value={newForm.description}
                onChange={(e) => setNewForm({...newForm, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="formCollection">Collection</Label>
              <Select 
                value={newForm.collection}
                onValueChange={(value) => setNewForm({...newForm, collection: value})}
              >
                <SelectTrigger id="formCollection">
                  <SelectValue placeholder="Select a collection" />
                </SelectTrigger>
                <SelectContent>
                  {mockCollections.map(collection => (
                    <SelectItem key={collection.id} value={collection.name}>
                      {collection.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Form data will be submitted to this collection.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button onClick={handleAddForm}>Create Form</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Field Dialog */}
      <Dialog open={showAddField} onOpenChange={setShowAddField}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Form Field</DialogTitle>
            <DialogDescription>
              Add a new field to the form.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="fieldLabel">Field Label</Label>
              <Input 
                id="fieldLabel" 
                placeholder="e.g. Email Address" 
                value={newField.label}
                onChange={(e) => setNewField({...newField, label: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fieldName">Field Name</Label>
              <Input 
                id="fieldName" 
                placeholder="e.g. email" 
                value={newField.name}
                onChange={(e) => setNewField({...newField, name: e.target.value})}
              />
              <p className="text-sm text-muted-foreground">
                Used as the field name in the database.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fieldType">Field Type</Label>
              <Select 
                value={newField.type}
                onValueChange={(value) => setNewField({...newField, type: value})}
              >
                <SelectTrigger id="fieldType">
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(newField.type === 'select' || newField.type === 'radio') && (
              <div className="space-y-2">
                <Label htmlFor="fieldOptions">Options (comma separated)</Label>
                <Input 
                  id="fieldOptions" 
                  placeholder="e.g. Option 1, Option 2, Option 3" 
                  value={newField.options}
                  onChange={(e) => setNewField({...newField, options: e.target.value})}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="fieldPlaceholder">Placeholder Text</Label>
              <Input 
                id="fieldPlaceholder" 
                placeholder="e.g. Enter your email address" 
                value={newField.placeholder}
                onChange={(e) => setNewField({...newField, placeholder: e.target.value})}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="fieldRequired"
                checked={newField.required}
                onChange={(e) => setNewField({...newField, required: e.target.checked})}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="fieldRequired">Required field</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddField(false)}>Cancel</Button>
            <Button onClick={handleAddField}>Add Field</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}