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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft, 
  Plus, 
  TableProperties,
  Search,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronDown,
  ArrowUpDown,
  RefreshCw
} from "lucide-react";

// Mock data for collections (normally would come from API)
const mockCollections = [
  { 
    id: "1", 
    name: "users", 
    displayName: "Users",
    fields: [
      { name: "id", displayName: "ID", type: "string" },
      { name: "name", displayName: "Name", type: "string" },
      { name: "email", displayName: "Email", type: "string" },
      { name: "role", displayName: "Role", type: "enum", options: ["admin", "user", "guest"] },
      { name: "createdAt", displayName: "Created At", type: "date" }
    ],
    records: [
      { id: "1", name: "John Doe", email: "john@example.com", role: "admin", createdAt: "2023-03-15T10:30:00Z" },
      { id: "2", name: "Jane Smith", email: "jane@example.com", role: "user", createdAt: "2023-04-10T09:15:00Z" },
      { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "user", createdAt: "2023-04-12T14:45:00Z" },
      { id: "4", name: "Alice Williams", email: "alice@example.com", role: "guest", createdAt: "2023-05-05T11:20:00Z" },
      { id: "5", name: "Charlie Brown", email: "charlie@example.com", role: "user", createdAt: "2023-05-08T16:30:00Z" }
    ]
  },
  { 
    id: "2", 
    name: "products", 
    displayName: "Products",
    fields: [
      { name: "id", displayName: "ID", type: "string" },
      { name: "name", displayName: "Name", type: "string" },
      { name: "price", displayName: "Price", type: "number" },
      { name: "description", displayName: "Description", type: "string" },
      { name: "inStock", displayName: "In Stock", type: "boolean" },
      { name: "createdAt", displayName: "Created At", type: "date" },
      { name: "updatedAt", displayName: "Updated At", type: "date" }
    ],
    records: [
      { id: "1", name: "Laptop", price: 1299.99, description: "High-performance laptop", inStock: true, createdAt: "2023-02-10T08:00:00Z", updatedAt: "2023-04-15T11:30:00Z" },
      { id: "2", name: "Smartphone", price: 799.99, description: "Latest smartphone model", inStock: true, createdAt: "2023-03-05T09:45:00Z", updatedAt: "2023-05-01T10:15:00Z" },
      { id: "3", name: "Headphones", price: 199.99, description: "Noise-cancelling headphones", inStock: true, createdAt: "2023-03-20T14:30:00Z", updatedAt: "2023-03-20T14:30:00Z" },
      { id: "4", name: "Tablet", price: 499.99, description: "10-inch tablet with stylus", inStock: false, createdAt: "2023-04-10T12:00:00Z", updatedAt: "2023-05-05T15:20:00Z" },
      { id: "5", name: "Smartwatch", price: 249.99, description: "Fitness tracking smartwatch", inStock: true, createdAt: "2023-04-25T10:30:00Z", updatedAt: "2023-04-25T10:30:00Z" }
    ]
  },
  { 
    id: "3", 
    name: "orders", 
    displayName: "Orders",
    fields: [
      { name: "id", displayName: "ID", type: "string" },
      { name: "customerName", displayName: "Customer Name", type: "string" },
      { name: "total", displayName: "Total", type: "number" },
      { name: "status", displayName: "Status", type: "enum", options: ["pending", "processing", "shipped", "delivered", "canceled"] },
      { name: "items", displayName: "Items Count", type: "number" },
      { name: "orderDate", displayName: "Order Date", type: "date" }
    ],
    records: [
      { id: "1", customerName: "John Doe", total: 1499.98, status: "delivered", items: 2, orderDate: "2023-04-15T10:30:00Z" },
      { id: "2", customerName: "Jane Smith", total: 799.99, status: "shipped", items: 1, orderDate: "2023-05-01T14:45:00Z" },
      { id: "3", customerName: "Bob Johnson", total: 249.99, status: "processing", items: 1, orderDate: "2023-05-08T09:15:00Z" },
      { id: "4", customerName: "Alice Williams", total: 699.98, status: "pending", items: 2, orderDate: "2023-05-10T16:30:00Z" },
      { id: "5", customerName: "Charlie Brown", total: 1999.97, status: "canceled", items: 3, orderDate: "2023-05-05T11:00:00Z" }
    ]
  }
];

export default function DataExplorer() {
  const [collections, setCollections] = useState(mockCollections);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showEditRecord, setShowEditRecord] = useState(false);
  const [newRecord, setNewRecord] = useState<Record<string, any>>({});
  const [editingRecord, setEditingRecord] = useState<Record<string, any>>({});

  const handleSelectCollection = (collection: any) => {
    setSelectedCollection(collection);
    setSearchTerm("");
    setSortField("");
    setSortDirection("asc");
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleAddRecord = () => {
    if (!selectedCollection) return;
    
    const currentDate = new Date().toISOString();
    const recordWithDefaults: Record<string, any> = {
      ...newRecord,
      id: String(Date.now()),
      createdAt: currentDate
    };
    
    if (selectedCollection.fields.some((f: any) => f.name === "updatedAt")) {
      recordWithDefaults.updatedAt = currentDate;
    }
    
    const updatedCollection = {
      ...selectedCollection,
      records: [...selectedCollection.records, recordWithDefaults]
    };
    
    setCollections(collections.map(c => c.id === selectedCollection.id ? updatedCollection : c));
    setSelectedCollection(updatedCollection);
    setNewRecord({});
    setShowAddRecord(false);
  };

  const handleEditRecord = () => {
    if (!selectedCollection) return;
    
    const recordWithUpdates = {
      ...editingRecord,
      updatedAt: selectedCollection.fields.some((f: any) => f.name === "updatedAt")
        ? new Date().toISOString()
        : editingRecord.updatedAt
    };
    
    const updatedCollection = {
      ...selectedCollection,
      records: selectedCollection.records.map((record: any) => 
        record.id === editingRecord.id ? recordWithUpdates : record
      )
    };
    
    setCollections(collections.map(c => c.id === selectedCollection.id ? updatedCollection : c));
    setSelectedCollection(updatedCollection);
    setEditingRecord({});
    setShowEditRecord(false);
  };

  const handleDeleteRecord = (id: string) => {
    if (!selectedCollection) return;
    
    const updatedCollection = {
      ...selectedCollection,
      records: selectedCollection.records.filter((record: any) => record.id !== id)
    };
    
    setCollections(collections.map(c => c.id === selectedCollection.id ? updatedCollection : c));
    setSelectedCollection(updatedCollection);
  };

  const filteredRecords = selectedCollection?.records.filter((record: any) => {
    if (!searchTerm) return true;
    
    // Search through all fields for matching text
    return Object.values(record).some(value => 
      value !== null && 
      value !== undefined && 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (!sortField) return 0;
    
    const valueA = a[sortField];
    const valueB = b[sortField];
    
    if (valueA === valueB) return 0;
    
    // Handle special type comparisons
    if (valueA === null || valueA === undefined) return sortDirection === "asc" ? -1 : 1;
    if (valueB === null || valueB === undefined) return sortDirection === "asc" ? 1 : -1;
    
    // Determine if we're dealing with dates
    const isDateField = selectedCollection?.fields.find((f: any) => f.name === sortField)?.type === "date";
    
    if (isDateField) {
      const dateA = new Date(valueA).getTime();
      const dateB = new Date(valueB).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }
    
    // Default string comparison
    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortDirection === "asc" 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    }
    
    // Numerical comparison
    return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
  });

  const formatCellValue = (value: any, fieldType: string) => {
    if (value === null || value === undefined) return "-";
    
    if (fieldType === "boolean") {
      return value ? "Yes" : "No";
    }
    
    if (fieldType === "date") {
      try {
        return new Date(value).toLocaleString();
      } catch (e) {
        return value;
      }
    }
    
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    
    return value.toString();
  };

  const initializeAddRecord = () => {
    if (!selectedCollection) return;
    
    const initialRecord: Record<string, any> = {};
    selectedCollection.fields.forEach((field: any) => {
      // Skip id and timestamp fields
      if (field.name === "id" || field.name === "createdAt" || field.name === "updatedAt") {
        return;
      }
      
      // Set default values based on type
      switch (field.type) {
        case "string":
          initialRecord[field.name] = "";
          break;
        case "number":
          initialRecord[field.name] = 0;
          break;
        case "boolean":
          initialRecord[field.name] = false;
          break;
        case "enum":
          initialRecord[field.name] = field.options?.[0] || "";
          break;
        default:
          initialRecord[field.name] = null;
      }
    });
    
    setNewRecord(initialRecord);
    setShowAddRecord(true);
  };

  const initializeEditRecord = (record: any) => {
    setEditingRecord({ ...record });
    setShowEditRecord(true);
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
        <h1 className="text-3xl font-bold">Data Explorer</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Collections</CardTitle>
            <CardDescription>
              Browse and manage data in your collections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {collections.map(collection => (
                <Button 
                  key={collection.id}
                  variant={selectedCollection?.id === collection.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleSelectCollection(collection)}
                >
                  <TableProperties className="mr-2 h-4 w-4" />
                  {collection.displayName}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          {selectedCollection ? (
            <>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedCollection.displayName}</CardTitle>
                    <CardDescription>
                      {selectedCollection.records.length} records
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-[200px]"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setSortField("");
                        setSortDirection("asc");
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                    <Button 
                      size="sm"
                      onClick={initializeAddRecord}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Record
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {selectedCollection.fields.map((field: any) => (
                          <TableHead key={field.name} className="max-w-[150px]">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1 font-medium"
                              onClick={() => handleSort(field.name)}
                            >
                              {field.displayName}
                              {sortField === field.name ? (
                                <ChevronDown className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""} transition-transform`} />
                              ) : (
                                <ArrowUpDown className="h-4 w-4 opacity-50" />
                              )}
                            </Button>
                          </TableHead>
                        ))}
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={selectedCollection.fields.length + 1} className="text-center py-8">
                            {searchTerm 
                              ? "No records matching your search" 
                              : "No records found in this collection"
                            }
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedRecords.map((record: any) => (
                          <TableRow key={record.id}>
                            {selectedCollection.fields.map((field: any) => (
                              <TableCell key={field.name} className="max-w-[150px] truncate">
                                {formatCellValue(record[field.name], field.type)}
                              </TableCell>
                            ))}
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => initializeEditRecord(record)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteRecord(record.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
              <TableProperties className="h-16 w-16 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Collection Selected</h3>
              <p className="text-muted-foreground mb-4">
                Select a collection from the list to view and manage its data.
              </p>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Add Record Dialog */}
      <Dialog open={showAddRecord} onOpenChange={setShowAddRecord}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Record to {selectedCollection?.displayName}</DialogTitle>
            <DialogDescription>
              Create a new record in the collection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            {selectedCollection?.fields.map((field: any) => {
              // Skip id and timestamp fields
              if (field.name === "id" || field.name === "createdAt" || field.name === "updatedAt") {
                return null;
              }
              
              switch (field.type) {
                case "string":
                case "number":
                  return (
                    <div key={field.name} className="space-y-2">
                      <label htmlFor={`new-${field.name}`} className="text-sm font-medium">
                        {field.displayName}
                      </label>
                      <Input 
                        id={`new-${field.name}`}
                        type={field.type === "number" ? "number" : "text"}
                        value={field.type === "number" ? Number(newRecord[field.name] || 0) : (newRecord[field.name] || "")}
                        onChange={(e) => setNewRecord({
                          ...newRecord, 
                          [field.name]: field.type === "number" ? Number(e.target.value) : e.target.value
                        })}
                      />
                    </div>
                  );
                case "boolean":
                  return (
                    <div key={field.name} className="space-y-2">
                      <label htmlFor={`new-${field.name}`} className="text-sm font-medium">
                        {field.displayName}
                      </label>
                      <Select 
                        value={newRecord[field.name] ? "true" : "false"}
                        onValueChange={(value) => setNewRecord({
                          ...newRecord, 
                          [field.name]: value === "true"
                        })}
                      >
                        <SelectTrigger id={`new-${field.name}`}>
                          <SelectValue placeholder="Select value" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                case "enum":
                  return (
                    <div key={field.name} className="space-y-2">
                      <label htmlFor={`new-${field.name}`} className="text-sm font-medium">
                        {field.displayName}
                      </label>
                      <Select 
                        value={newRecord[field.name] || ""}
                        onValueChange={(value) => setNewRecord({
                          ...newRecord, 
                          [field.name]: value
                        })}
                      >
                        <SelectTrigger id={`new-${field.name}`}>
                          <SelectValue placeholder="Select value" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRecord(false)}>Cancel</Button>
            <Button onClick={handleAddRecord}>Add Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Record Dialog */}
      <Dialog open={showEditRecord} onOpenChange={setShowEditRecord}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
            <DialogDescription>
              Update record in {selectedCollection?.displayName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            {selectedCollection?.fields.map((field: any) => {
              // Skip id and timestamp fields
              if (field.name === "id" || field.name === "createdAt" || field.name === "updatedAt") {
                return null;
              }
              
              switch (field.type) {
                case "string":
                case "number":
                  return (
                    <div key={field.name} className="space-y-2">
                      <label htmlFor={`edit-${field.name}`} className="text-sm font-medium">
                        {field.displayName}
                      </label>
                      <Input 
                        id={`edit-${field.name}`}
                        type={field.type === "number" ? "number" : "text"}
                        value={field.type === "number" ? Number(editingRecord[field.name] || 0) : (editingRecord[field.name] || "")}
                        onChange={(e) => setEditingRecord({
                          ...editingRecord, 
                          [field.name]: field.type === "number" ? Number(e.target.value) : e.target.value
                        })}
                      />
                    </div>
                  );
                case "boolean":
                  return (
                    <div key={field.name} className="space-y-2">
                      <label htmlFor={`edit-${field.name}`} className="text-sm font-medium">
                        {field.displayName}
                      </label>
                      <Select 
                        value={editingRecord[field.name] ? "true" : "false"}
                        onValueChange={(value) => setEditingRecord({
                          ...editingRecord, 
                          [field.name]: value === "true"
                        })}
                      >
                        <SelectTrigger id={`edit-${field.name}`}>
                          <SelectValue placeholder="Select value" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                case "enum":
                  return (
                    <div key={field.name} className="space-y-2">
                      <label htmlFor={`edit-${field.name}`} className="text-sm font-medium">
                        {field.displayName}
                      </label>
                      <Select 
                        value={editingRecord[field.name] || ""}
                        onValueChange={(value) => setEditingRecord({
                          ...editingRecord, 
                          [field.name]: value
                        })}
                      >
                        <SelectTrigger id={`edit-${field.name}`}>
                          <SelectValue placeholder="Select value" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRecord(false)}>Cancel</Button>
            <Button onClick={handleEditRecord}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}