import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, ArrowLeft, Database, Plus } from "lucide-react";
import { Link } from "wouter";

const fieldTypes = [
  { value: "string", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" },
  { value: "enum", label: "Select" },
  { value: "relation", label: "Relation" }
];

const mockSchemas = [
  { id: "1", name: "users", displayName: "Users", fields: [
    { id: "1", name: "name", displayName: "Name", type: "string", required: true },
    { id: "2", name: "email", displayName: "Email", type: "string", required: true },
    { id: "3", name: "role", displayName: "Role", type: "enum", required: true, options: ["admin", "user", "guest"] }
  ]},
  { id: "2", name: "products", displayName: "Products", fields: [
    { id: "1", name: "name", displayName: "Name", type: "string", required: true },
    { id: "2", name: "price", displayName: "Price", type: "number", required: true },
    { id: "3", name: "description", displayName: "Description", type: "string", required: false },
    { id: "4", name: "inStock", displayName: "In Stock", type: "boolean", required: true }
  ]}
];

export default function SchemaDesigner() {
  const [schemas, setSchemas] = useState(mockSchemas);
  const [selectedSchema, setSelectedSchema] = useState<any>(null);
  const [showAddSchema, setShowAddSchema] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  
  const [newSchema, setNewSchema] = useState({ name: "", displayName: "" });
  const [newField, setNewField] = useState({ 
    name: "", 
    displayName: "", 
    type: "string", 
    required: false,
    options: ""
  });

  const handleAddSchema = () => {
    const schema = {
      id: String(Date.now()),
      name: newSchema.name.toLowerCase().replace(/\s+/g, '_'),
      displayName: newSchema.displayName,
      fields: []
    };
    
    setSchemas([...schemas, schema]);
    setNewSchema({ name: "", displayName: "" });
    setShowAddSchema(false);
  };

  const handleSelectSchema = (schema: any) => {
    setSelectedSchema(schema);
  };

  const handleAddField = () => {
    if (!selectedSchema) return;
    
    const field = {
      id: String(Date.now()),
      name: newField.name.toLowerCase().replace(/\s+/g, '_'),
      displayName: newField.displayName,
      type: newField.type,
      required: newField.required,
      options: newField.type === 'enum' ? newField.options.split(',').map(o => o.trim()) : undefined
    };
    
    const updatedSchema = {
      ...selectedSchema,
      fields: [...selectedSchema.fields, field]
    };
    
    setSchemas(schemas.map(s => s.id === selectedSchema.id ? updatedSchema : s));
    setSelectedSchema(updatedSchema);
    setNewField({ name: "", displayName: "", type: "string", required: false, options: "" });
    setShowAddField(false);
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
        <h1 className="text-3xl font-bold">Schema Designer</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Schemas</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAddSchema(true)}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {schemas.map(schema => (
                <Button 
                  key={schema.id}
                  variant={selectedSchema?.id === schema.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleSelectSchema(schema)}
                >
                  <Database className="mr-2 h-4 w-4" />
                  {schema.displayName}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          {selectedSchema ? (
            <>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{selectedSchema.displayName} Schema</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddField(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Field
                  </Button>
                </CardTitle>
                <CardDescription>
                  Technical name: {selectedSchema.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="fields">
                  <TabsList className="mb-4">
                    <TabsTrigger value="fields">Fields</TabsTrigger>
                    <TabsTrigger value="json">JSON</TabsTrigger>
                  </TabsList>
                  <TabsContent value="fields">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Display Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Required</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSchema.fields.map((field: any) => (
                          <TableRow key={field.id}>
                            <TableCell>{field.name}</TableCell>
                            <TableCell>{field.displayName}</TableCell>
                            <TableCell>{field.type}</TableCell>
                            <TableCell>{field.required ? "Yes" : "No"}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  <TabsContent value="json">
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
                      {JSON.stringify(selectedSchema, null, 2)}
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
              <Database className="h-16 w-16 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Schema Selected</h3>
              <p className="text-muted-foreground mb-4">
                Select a schema from the left panel or create a new one.
              </p>
              <Button onClick={() => setShowAddSchema(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Schema
              </Button>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Add Schema Dialog */}
      <Dialog open={showAddSchema} onOpenChange={setShowAddSchema}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Schema</DialogTitle>
            <DialogDescription>
              Add a new data model to your application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="schemaDisplayName">Display Name</Label>
              <Input 
                id="schemaDisplayName" 
                placeholder="e.g. Products" 
                value={newSchema.displayName}
                onChange={(e) => setNewSchema({...newSchema, displayName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schemaName">Technical Name</Label>
              <Input 
                id="schemaName" 
                placeholder="e.g. products" 
                value={newSchema.name}
                onChange={(e) => setNewSchema({...newSchema, name: e.target.value})}
              />
              <p className="text-sm text-muted-foreground">
                This will be used as the collection name in the database.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSchema(false)}>Cancel</Button>
            <Button onClick={handleAddSchema}>Create Schema</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Field Dialog */}
      <Dialog open={showAddField} onOpenChange={setShowAddField}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Field</DialogTitle>
            <DialogDescription>
              Add a field to the {selectedSchema?.displayName} schema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="fieldDisplayName">Display Name</Label>
              <Input 
                id="fieldDisplayName" 
                placeholder="e.g. Product Name" 
                value={newField.displayName}
                onChange={(e) => setNewField({...newField, displayName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fieldName">Technical Name</Label>
              <Input 
                id="fieldName" 
                placeholder="e.g. product_name" 
                value={newField.name}
                onChange={(e) => setNewField({...newField, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fieldType">Field Type</Label>
              <Select 
                value={newField.type}
                onValueChange={(value) => setNewField({...newField, type: value})}
              >
                <SelectTrigger>
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

            {newField.type === "enum" && (
              <div className="space-y-2">
                <Label htmlFor="fieldOptions">Options (comma separated)</Label>
                <Input 
                  id="fieldOptions" 
                  placeholder="e.g. small, medium, large" 
                  value={newField.options}
                  onChange={(e) => setNewField({...newField, options: e.target.value})}
                />
              </div>
            )}

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