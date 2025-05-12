import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Mock data for schemas and forms (in a real app, this would be in a database)
let schemas = [
  {
    id: "1",
    name: "users",
    displayName: "Users",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    collections: [
      {
        id: "1",
        name: "users",
        displayName: "Users",
        fields: [
          { id: "1", name: "name", displayName: "Name", type: "string", required: true },
          { id: "2", name: "email", displayName: "Email", type: "string", required: true },
          { id: "3", name: "role", displayName: "Role", type: "enum", required: true, options: ["admin", "user", "guest"] }
        ]
      }
    ]
  },
  {
    id: "2",
    name: "products",
    displayName: "Products",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    collections: [
      {
        id: "1",
        name: "products",
        displayName: "Products",
        fields: [
          { id: "1", name: "name", displayName: "Name", type: "string", required: true },
          { id: "2", name: "price", displayName: "Price", type: "number", required: true },
          { id: "3", name: "description", displayName: "Description", type: "string", required: false },
          { id: "4", name: "inStock", displayName: "In Stock", type: "boolean", required: true }
        ]
      }
    ]
  }
];

let forms = [
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
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function registerRoutes(app: Express): Promise<Server> {
  // Schemas API
  app.get("/api/schemas", (req: Request, res: Response) => {
    res.json(schemas);
  });

  app.get("/api/schemas/:id", (req: Request, res: Response) => {
    const schema = schemas.find(s => s.id === req.params.id);
    if (!schema) {
      return res.status(404).json({ message: "Schema not found" });
    }
    res.json(schema);
  });

  app.post("/api/schemas", (req: Request, res: Response) => {
    const { name, displayName } = req.body;
    
    // Basic validation
    if (!name || !displayName) {
      return res.status(400).json({ message: "Name and displayName are required" });
    }
    
    // Check for duplicate names
    if (schemas.some(s => s.name === name)) {
      return res.status(409).json({ message: "Schema with this name already exists" });
    }
    
    const newSchema = {
      id: String(Date.now()),
      name,
      displayName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      collections: []
    };
    
    schemas.push(newSchema);
    res.status(201).json(newSchema);
  });

  app.put("/api/schemas/:id", (req: Request, res: Response) => {
    const { name, displayName } = req.body;
    const schemaIndex = schemas.findIndex(s => s.id === req.params.id);
    
    if (schemaIndex === -1) {
      return res.status(404).json({ message: "Schema not found" });
    }
    
    // Basic validation
    if (!name || !displayName) {
      return res.status(400).json({ message: "Name and displayName are required" });
    }
    
    // Check for duplicate names, excluding current schema
    if (schemas.some(s => s.name === name && s.id !== req.params.id)) {
      return res.status(409).json({ message: "Schema with this name already exists" });
    }
    
    const updatedSchema = {
      ...schemas[schemaIndex],
      name,
      displayName,
      updatedAt: new Date().toISOString()
    };
    
    schemas[schemaIndex] = updatedSchema;
    res.json(updatedSchema);
  });

  app.delete("/api/schemas/:id", (req: Request, res: Response) => {
    const schemaIndex = schemas.findIndex(s => s.id === req.params.id);
    
    if (schemaIndex === -1) {
      return res.status(404).json({ message: "Schema not found" });
    }
    
    schemas.splice(schemaIndex, 1);
    res.status(204).send();
  });

  // Collections API (nested under schemas)
  app.post("/api/schemas/:schemaId/collections", (req: Request, res: Response) => {
    const { name, displayName, fields } = req.body;
    const schema = schemas.find(s => s.id === req.params.schemaId);
    
    if (!schema) {
      return res.status(404).json({ message: "Schema not found" });
    }
    
    // Basic validation
    if (!name || !displayName) {
      return res.status(400).json({ message: "Name and displayName are required" });
    }
    
    // Check for duplicate collection names
    if (schema.collections.some(c => c.name === name)) {
      return res.status(409).json({ message: "Collection with this name already exists in this schema" });
    }
    
    const newCollection = {
      id: String(Date.now()),
      name,
      displayName,
      fields: fields || []
    };
    
    schema.collections.push(newCollection);
    schema.updatedAt = new Date().toISOString();
    
    res.status(201).json(newCollection);
  });

  // Forms API
  app.get("/api/forms", (req: Request, res: Response) => {
    res.json(forms);
  });

  app.get("/api/forms/:id", (req: Request, res: Response) => {
    const form = forms.find(f => f.id === req.params.id);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    res.json(form);
  });

  app.post("/api/forms", (req: Request, res: Response) => {
    const { name, displayName, description, collection } = req.body;
    
    // Basic validation
    if (!name || !displayName || !collection) {
      return res.status(400).json({ message: "Name, displayName, and collection are required" });
    }
    
    // Check for duplicate names
    if (forms.some(f => f.name === name)) {
      return res.status(409).json({ message: "Form with this name already exists" });
    }
    
    const newForm = {
      id: String(Date.now()),
      name,
      displayName,
      description,
      collection,
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    forms.push(newForm);
    res.status(201).json(newForm);
  });

  app.put("/api/forms/:id", (req: Request, res: Response) => {
    const { name, displayName, description, collection, fields } = req.body;
    const formIndex = forms.findIndex(f => f.id === req.params.id);
    
    if (formIndex === -1) {
      return res.status(404).json({ message: "Form not found" });
    }
    
    // Basic validation
    if (!name || !displayName || !collection) {
      return res.status(400).json({ message: "Name, displayName, and collection are required" });
    }
    
    // Check for duplicate names, excluding current form
    if (forms.some(f => f.name === name && f.id !== req.params.id)) {
      return res.status(409).json({ message: "Form with this name already exists" });
    }
    
    const updatedForm = {
      ...forms[formIndex],
      name,
      displayName,
      description,
      collection,
      fields: fields || forms[formIndex].fields,
      updatedAt: new Date().toISOString()
    };
    
    forms[formIndex] = updatedForm;
    res.json(updatedForm);
  });

  app.delete("/api/forms/:id", (req: Request, res: Response) => {
    const formIndex = forms.findIndex(f => f.id === req.params.id);
    
    if (formIndex === -1) {
      return res.status(404).json({ message: "Form not found" });
    }
    
    forms.splice(formIndex, 1);
    res.status(204).send();
  });

  // Auth routes (basic)
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    try {
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      res.json({ 
        id: user.id, 
        username: user.username 
      });
    } catch (error) {
      res.status(500).json({ message: "Error during login" });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    try {
      const existingUser = await storage.getUserByUsername(username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser({ username, password });
      
      res.status(201).json({ 
        id: newUser.id, 
        username: newUser.username 
      });
    } catch (error) {
      res.status(500).json({ message: "Error during registration" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
