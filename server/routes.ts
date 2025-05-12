import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";

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

// JWT secret key (in a real app, this would be in environment variables)
const JWT_SECRET = "nocostudio-secret-key";
const TOKEN_EXPIRATION = "24h";

// Authentication middleware
const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  // Skip authentication for auth routes and options requests
  if (
    req.path.startsWith("/api/auth/") ||
    req.method === "OPTIONS"
  ) {
    return next();
  }

  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }
      
      // Add user data to request for use in route handlers
      (req as any).user = user;
      next();
    });
  } else {
    // For development purposes, we'll allow unauthorized access
    // In production, you would uncomment the following line:
    // return res.status(401).json({ message: "Authentication required" });
    next();
  }
};

// Generate JWT token
const generateToken = (user: any) => {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply authentication middleware
  app.use(authenticateJWT);
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

  // Mock data for workflows
  let workflows = [
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executions: [
        {
          id: "1",
          status: "completed",
          startedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          completedAt: new Date(Date.now() - 86400000 + 3000).toISOString(), // 3 seconds later
          steps: [
            { id: "1", status: "completed", result: true },
            { id: "2", status: "completed", result: { success: true } },
            { id: "3", status: "completed", result: { id: "folder-123" } }
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executions: [
        {
          id: "1",
          status: "completed",
          startedAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          completedAt: new Date(Date.now() - 43200000 + 4000).toISOString(), // 4 seconds later
          steps: [
            { id: "1", status: "completed", result: { success: true } },
            { id: "2", status: "completed", result: true },
            { id: "3", status: "completed", result: { success: true } }
          ]
        },
        {
          id: "2",
          status: "failed",
          startedAt: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
          completedAt: new Date(Date.now() - 21600000 + 2000).toISOString(), // 2 seconds later
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

  // Workflows API
  app.get("/api/workflows", (req: Request, res: Response) => {
    res.json(workflows);
  });

  app.get("/api/workflows/:id", (req: Request, res: Response) => {
    const workflow = workflows.find(w => w.id === req.params.id);
    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }
    res.json(workflow);
  });

  app.post("/api/workflows", (req: Request, res: Response) => {
    const { name, displayName, description, trigger } = req.body;
    
    // Basic validation
    if (!name || !displayName || !trigger) {
      return res.status(400).json({ message: "Name, displayName, and trigger are required" });
    }
    
    // Check for duplicate names
    if (workflows.some(w => w.name === name)) {
      return res.status(409).json({ message: "Workflow with this name already exists" });
    }
    
    const newWorkflow = {
      id: String(Date.now()),
      name,
      displayName,
      description,
      trigger,
      active: true,
      steps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executions: []
    };
    
    workflows.push(newWorkflow);
    res.status(201).json(newWorkflow);
  });

  app.put("/api/workflows/:id", (req: Request, res: Response) => {
    const { name, displayName, description, trigger, steps, active } = req.body;
    const workflowIndex = workflows.findIndex(w => w.id === req.params.id);
    
    if (workflowIndex === -1) {
      return res.status(404).json({ message: "Workflow not found" });
    }
    
    // Basic validation
    if (!name || !displayName) {
      return res.status(400).json({ message: "Name and displayName are required" });
    }
    
    // Check for duplicate names, excluding current workflow
    if (workflows.some(w => w.name === name && w.id !== req.params.id)) {
      return res.status(409).json({ message: "Workflow with this name already exists" });
    }
    
    const updatedWorkflow = {
      ...workflows[workflowIndex],
      name,
      displayName,
      description,
      trigger: trigger || workflows[workflowIndex].trigger,
      active: active !== undefined ? active : workflows[workflowIndex].active,
      steps: steps || workflows[workflowIndex].steps,
      updatedAt: new Date().toISOString()
    };
    
    workflows[workflowIndex] = updatedWorkflow;
    res.json(updatedWorkflow);
  });

  app.delete("/api/workflows/:id", (req: Request, res: Response) => {
    const workflowIndex = workflows.findIndex(w => w.id === req.params.id);
    
    if (workflowIndex === -1) {
      return res.status(404).json({ message: "Workflow not found" });
    }
    
    workflows.splice(workflowIndex, 1);
    res.status(204).send();
  });

  // Toggle workflow active status
  app.patch("/api/workflows/:id/toggle", (req: Request, res: Response) => {
    const workflowIndex = workflows.findIndex(w => w.id === req.params.id);
    
    if (workflowIndex === -1) {
      return res.status(404).json({ message: "Workflow not found" });
    }
    
    const updatedWorkflow = {
      ...workflows[workflowIndex],
      active: !workflows[workflowIndex].active,
      updatedAt: new Date().toISOString()
    };
    
    workflows[workflowIndex] = updatedWorkflow;
    res.json(updatedWorkflow);
  });

  // Add a step to a workflow
  app.post("/api/workflows/:id/steps", (req: Request, res: Response) => {
    const { type, name, config } = req.body;
    const workflow = workflows.find(w => w.id === req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }
    
    // Basic validation
    if (!type || !name) {
      return res.status(400).json({ message: "Type and name are required" });
    }
    
    const newStep = {
      id: String(Date.now()),
      type,
      name,
      config: config || {}
    };
    
    workflow.steps.push(newStep);
    workflow.updatedAt = new Date().toISOString();
    
    res.status(201).json(newStep);
  });

  // Get workflow executions
  app.get("/api/workflows/:id/executions", (req: Request, res: Response) => {
    const workflow = workflows.find(w => w.id === req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }
    
    res.json(workflow.executions || []);
  });

  // Execute a workflow (simulate)
  app.post("/api/workflows/:id/execute", (req: Request, res: Response) => {
    const workflow = workflows.find(w => w.id === req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }
    
    if (!workflow.active) {
      return res.status(400).json({ message: "Cannot execute inactive workflow" });
    }
    
    const startedAt = new Date().toISOString();
    
    // Simulate execution delay
    setTimeout(() => {
      const execution = {
        id: String(Date.now()),
        status: "completed",
        startedAt,
        completedAt: new Date().toISOString(),
        steps: workflow.steps.map(step => ({
          id: step.id,
          status: "completed",
          result: step.type === 'condition' ? true : { success: true }
        }))
      };
      
      if (!workflow.executions) {
        workflow.executions = [];
      }
      
      workflow.executions.push(execution);
    }, 2000); // 2 second delay
    
    res.status(202).json({ message: "Workflow execution started", executionId: String(Date.now()) });
  });

  // Mock data for roles and users
  let roles = [
    {
      id: "1",
      name: "admin",
      displayName: "Administrator",
      description: "Full access to all system features",
      permissions: [
        { resource: "users", actions: ["create", "read", "update", "delete"] },
        { resource: "schemas", actions: ["create", "read", "update", "delete"] },
        { resource: "forms", actions: ["create", "read", "update", "delete"] },
        { resource: "workflows", actions: ["create", "read", "update", "delete"] },
        { resource: "roles", actions: ["create", "read", "update", "delete"] }
      ],
      users: [
        { id: "1", username: "admin", email: "admin@example.com" }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "2",
      name: "editor",
      displayName: "Editor",
      description: "Can create and edit content, but cannot manage users or system settings",
      permissions: [
        { resource: "users", actions: ["read"] },
        { resource: "schemas", actions: ["read", "update"] },
        { resource: "forms", actions: ["create", "read", "update"] },
        { resource: "workflows", actions: ["read", "update"] },
        { resource: "roles", actions: ["read"] }
      ],
      users: [
        { id: "2", username: "editor1", email: "editor1@example.com" },
        { id: "3", username: "editor2", email: "editor2@example.com" }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "3",
      name: "viewer",
      displayName: "Viewer",
      description: "Read-only access to data",
      permissions: [
        { resource: "users", actions: ["read"] },
        { resource: "schemas", actions: ["read"] },
        { resource: "forms", actions: ["read"] },
        { resource: "workflows", actions: ["read"] },
        { resource: "roles", actions: [] }
      ],
      users: [
        { id: "4", username: "viewer1", email: "viewer1@example.com" }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Define the user interface to fix TypeScript errors
  interface AppUser {
    id: string;
    username: string;
    email: string;
    password: string;
    fullName?: string;
    role: string | null;
  }

  let appUsers: AppUser[] = [
    { id: "1", username: "admin", email: "admin@example.com", password: "admin123", fullName: "Admin User", role: "admin" },
    { id: "2", username: "editor1", email: "editor1@example.com", password: "editor123", fullName: "Editor One", role: "editor" },
    { id: "3", username: "editor2", email: "editor2@example.com", password: "editor456", fullName: "Editor Two", role: "editor" },
    { id: "4", username: "viewer1", email: "viewer1@example.com", password: "viewer123", fullName: "Viewer One", role: "viewer" },
    { id: "5", username: "user1", email: "user1@example.com", password: "user123", role: null }
  ];

  // Roles API
  app.get("/api/roles", (req: Request, res: Response) => {
    // Remove sensitive information (like users' passwords)
    const safeRoles = roles.map(role => ({
      ...role,
      users: role.users.map(user => {
        const fullUser = appUsers.find(u => u.id === user.id);
        return {
          id: user.id,
          username: user.username,
          email: user.email || fullUser?.email
        };
      })
    }));
    
    res.json(safeRoles);
  });

  app.get("/api/roles/:id", (req: Request, res: Response) => {
    const role = roles.find(r => r.id === req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    
    // Remove sensitive information
    const safeRole = {
      ...role,
      users: role.users.map(user => {
        const fullUser = appUsers.find(u => u.id === user.id);
        return {
          id: user.id,
          username: user.username,
          email: user.email || fullUser?.email
        };
      })
    };
    
    res.json(safeRole);
  });

  app.post("/api/roles", (req: Request, res: Response) => {
    const { name, displayName, description } = req.body;
    
    // Basic validation
    if (!name || !displayName) {
      return res.status(400).json({ message: "Name and displayName are required" });
    }
    
    // Check for duplicate names
    if (roles.some(r => r.name === name)) {
      return res.status(409).json({ message: "Role with this name already exists" });
    }
    
    const newRole = {
      id: String(Date.now()),
      name,
      displayName,
      description,
      permissions: [],
      users: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    roles.push(newRole);
    res.status(201).json(newRole);
  });

  app.put("/api/roles/:id", (req: Request, res: Response) => {
    const { name, displayName, description, permissions } = req.body;
    const roleIndex = roles.findIndex(r => r.id === req.params.id);
    
    if (roleIndex === -1) {
      return res.status(404).json({ message: "Role not found" });
    }
    
    // Basic validation
    if (!name || !displayName) {
      return res.status(400).json({ message: "Name and displayName are required" });
    }
    
    // Check for duplicate names, excluding current role
    if (roles.some(r => r.name === name && r.id !== req.params.id)) {
      return res.status(409).json({ message: "Role with this name already exists" });
    }
    
    const updatedRole = {
      ...roles[roleIndex],
      name,
      displayName,
      description,
      permissions: permissions || roles[roleIndex].permissions,
      updatedAt: new Date().toISOString()
    };
    
    roles[roleIndex] = updatedRole;
    res.json(updatedRole);
  });

  app.delete("/api/roles/:id", (req: Request, res: Response) => {
    const roleIndex = roles.findIndex(r => r.id === req.params.id);
    
    if (roleIndex === -1) {
      return res.status(404).json({ message: "Role not found" });
    }
    
    // Remove role from users
    appUsers = appUsers.map(user => {
      if (user.role === roles[roleIndex].name) {
        return { ...user, role: null };
      }
      return user;
    });
    
    roles.splice(roleIndex, 1);
    res.status(204).send();
  });

  // Add user to role
  app.post("/api/roles/:id/users/:userId", (req: Request, res: Response) => {
    const role = roles.find(r => r.id === req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    
    const user = appUsers.find(u => u.id === req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if user is already in this role
    if (role.users.some(u => u.id === user.id)) {
      return res.status(409).json({ message: "User is already assigned to this role" });
    }
    
    // Add user to role
    role.users.push({
      id: user.id,
      username: user.username,
      email: user.email
    });
    
    // Update user's role
    user.role = role.name;
    
    res.status(200).json({ message: "User added to role successfully" });
  });

  // Remove user from role
  app.delete("/api/roles/:id/users/:userId", (req: Request, res: Response) => {
    const role = roles.find(r => r.id === req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    
    const userIndex = role.users.findIndex(u => u.id === req.params.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found in this role" });
    }
    
    // Remove user from role
    role.users.splice(userIndex, 1);
    
    // Update user's role
    const user = appUsers.find(u => u.id === req.params.userId);
    if (user) {
      user.role = null;
    }
    
    res.status(204).send();
  });

  // Users API
  app.get("/api/users", (req: Request, res: Response) => {
    // Remove sensitive information
    const safeUsers = appUsers.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }));
    
    res.json(safeUsers);
  });

  app.get("/api/users/:id", (req: Request, res: Response) => {
    const user = appUsers.find(u => u.id === req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove sensitive information
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName || "",
      role: user.role
    };
    
    res.json(safeUser);
  });
  
  app.patch("/api/users/:id", (req: Request, res: Response) => {
    const { username, email, fullName } = req.body;
    const userIndex = appUsers.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if username is already taken by another user
    if (username && username !== appUsers[userIndex].username) {
      const usernameExists = appUsers.some(u => u.username === username && u.id !== req.params.id);
      if (usernameExists) {
        return res.status(409).json({ message: "Username is already taken" });
      }
    }
    
    // Check if email is already taken by another user
    if (email && email !== appUsers[userIndex].email) {
      const emailExists = appUsers.some(u => u.email === email && u.id !== req.params.id);
      if (emailExists) {
        return res.status(409).json({ message: "Email is already taken" });
      }
    }
    
    // Update user
    appUsers[userIndex] = {
      ...appUsers[userIndex],
      username: username || appUsers[userIndex].username,
      email: email || appUsers[userIndex].email,
      fullName: fullName !== undefined ? fullName : (appUsers[userIndex].fullName || "")
    };
    
    // Remove sensitive information
    const safeUser = {
      id: appUsers[userIndex].id,
      username: appUsers[userIndex].username,
      email: appUsers[userIndex].email,
      fullName: appUsers[userIndex].fullName || "",
      role: appUsers[userIndex].role
    };
    
    res.json(safeUser);
  });
  
  app.post("/api/users/:id/change-password", (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const user = appUsers.find(u => u.id === req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Verify current password
    if (user.password !== currentPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    
    // Update password
    user.password = newPassword;
    
    res.status(200).json({ message: "Password changed successfully" });
  });

  // Password reset tokens storage (in-memory for demo)
  let passwordResetTokens: { [key: string]: { email: string, expiresAt: Date } } = {};

  // Auth routes
  app.post("/api/auth/forgot-password", (req: Request, res: Response) => {
    const { email } = req.body;
    
    // Check if email exists
    const user = appUsers.find(u => u.email === email);
    
    if (!user) {
      // For security reasons, don't reveal if the email exists
      return res.status(200).json({ 
        message: "If your email is registered, you will receive a password reset link" 
      });
    }
    
    // Generate token
    const token = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    
    // Set expiration (15 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    
    // Store token
    passwordResetTokens[token] = {
      email: user.email,
      expiresAt
    };
    
    // In a real application, send an email with the reset link
    // For demo, we'll just log it
    console.log(`Password reset link: http://localhost:5000/auth/reset-password?token=${token}`);
    
    res.status(200).json({ 
      message: "If your email is registered, you will receive a password reset link" 
    });
  });

  app.get("/api/auth/verify-reset-token", (req: Request, res: Response) => {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: "Token is required" });
    }
    
    const tokenData = passwordResetTokens[token];
    
    if (!tokenData) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    
    if (new Date() > tokenData.expiresAt) {
      delete passwordResetTokens[token];
      return res.status(400).json({ message: "Token has expired" });
    }
    
    res.status(200).json({ message: "Token is valid" });
  });

  app.post("/api/auth/reset-password", (req: Request, res: Response) => {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }
    
    const tokenData = passwordResetTokens[token];
    
    if (!tokenData) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    
    if (new Date() > tokenData.expiresAt) {
      delete passwordResetTokens[token];
      return res.status(400).json({ message: "Token has expired" });
    }
    
    // Update user's password
    const user = appUsers.find(u => u.email === tokenData.email);
    
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    
    user.password = password;
    
    // Remove used token
    delete passwordResetTokens[token];
    
    res.status(200).json({ message: "Password has been reset successfully" });
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    try {
      // First check mock users
      const mockUser = appUsers.find(u => u.username === username && u.password === password);
      
      if (mockUser) {
        // Generate JWT token
        const token = generateToken(mockUser);
        
        return res.json({ 
          id: mockUser.id, 
          username: mockUser.username,
          email: mockUser.email,
          fullName: mockUser.fullName || "",
          role: mockUser.role,
          token
        });
      }
      
      // Then check storage
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Generate JWT token for storage-based users
      const token = generateToken(user);
      
      res.json({ 
        id: user.id, 
        username: user.username,
        token
      });
    } catch (error) {
      res.status(500).json({ message: "Error during login" });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    
    try {
      // Check mock users first
      if (appUsers.some(u => u.username === username)) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Then check storage
      const existingUser = await storage.getUserByUsername(username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Create mock user if we're using the mock data
      if (appUsers.length > 0) {
        const newUser = {
          id: String(Date.now()),
          username,
          email,
          password,
          role: null
        };
        
        appUsers.push(newUser);
        
        // Generate JWT token for new user
        const token = generateToken(newUser);
        
        return res.status(201).json({ 
          id: newUser.id, 
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          token
        });
      }
      
      // Otherwise use storage
      const newUser = await storage.createUser({ username, password });
      
      // Generate JWT token for storage-based users
      const token = generateToken(newUser);
      
      res.status(201).json({ 
        id: newUser.id, 
        username: newUser.username,
        token
      });
    } catch (error) {
      res.status(500).json({ message: "Error during registration" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const router = Router();
const TOKEN_EXPIRY = '15m';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.APP_URL}/api/auth/google/callback`
);

// Google OAuth routes
router.get('/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email']
  });
  res.json({ url });
});

router.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    const oauth2 = new OAuth2Client();
    oauth2.setCredentials(tokens);
    const userInfo = await oauth2.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo'
    });

    const user = {
      id: userInfo.data.sub,
      email: userInfo.data.email,
      username: userInfo.data.name
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    res.redirect(`/?token=${token}`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect('/auth/login?error=oauth_failed');
  }
});

// GitHub OAuth routes
router.get('/auth/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
  res.json({ url: githubAuthUrl });
});

router.get('/auth/github/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const data = await response.json();
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${data.access_token}`
      }
    });

    const githubUser = await userResponse.json();
    const user = {
      id: githubUser.id.toString(),
      username: githubUser.login,
      email: githubUser.email
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    res.redirect(`/?token=${token}`);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect('/auth/login?error=oauth_failed');
  }
});

// Token refresh endpoint
router.post('/auth/refresh', async (req, res) => {
  try {
    const currentToken = req.headers.authorization?.split(' ')[1];
    if (!currentToken) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify current token
    try {
      const decoded = jwt.verify(currentToken, JWT_SECRET) as { id: string; exp: number };
      
      // Generate new token
      const newToken = jwt.sign({ id: decoded.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
      
      return res.json({ token: newToken });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
router.post('/auth/refresh', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const newToken = jwt.sign({ id: decoded.id, email: decoded.email }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY
    });

    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
