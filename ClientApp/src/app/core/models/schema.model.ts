export interface Field {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  type: FieldType;
  required: boolean;
  unique: boolean;
  defaultValue?: any;
  options?: FieldOption[];
  validations?: Validation[];
  settings?: Record<string, any>;
}

export interface FieldOption {
  label: string;
  value: string | number | boolean;
}

export interface Validation {
  type: string;
  params?: any;
  message: string;
}

export enum FieldType {
  String = 'string',
  Text = 'text',
  Number = 'number',
  Integer = 'integer',
  Decimal = 'decimal',
  Boolean = 'boolean',
  Date = 'date',
  DateTime = 'datetime',
  Email = 'email',
  Password = 'password',
  Enum = 'enum',
  JSON = 'json',
  UUID = 'uuid',
  Relation = 'relation',
  File = 'file',
  Image = 'image'
}

export enum RelationType {
  OneToOne = 'oneToOne',
  OneToMany = 'oneToMany',
  ManyToOne = 'manyToOne',
  ManyToMany = 'manyToMany'
}

export interface RelationField extends Field {
  relationType: RelationType;
  targetCollection: string;
  foreignKey?: string;
  through?: string;
  targetField?: string;
}

export interface Collection {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  fields: Field[];
  indexes?: Index[];
  isSystem?: boolean;
  timestamps?: boolean;
}

export interface Index {
  name: string;
  fields: string[];
  unique: boolean;
}

export interface Schema {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  collections: Collection[];
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormConfig {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  collection: string;
  layouts: FormLayout[];
  fields: FormField[];
  actions: FormAction[];
  createdAt: string;
  updatedAt: string;
}

export interface FormLayout {
  id: string;
  type: 'grid' | 'tabs' | 'steps' | 'sections';
  config: any;
}

export interface FormField {
  id: string;
  fieldId: string;
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  settings: {
    label?: string;
    description?: string;
    placeholder?: string;
    disabled?: boolean;
    hidden?: boolean;
    defaultValue?: any;
    component?: string;
  };
}

export interface FormAction {
  id: string;
  type: 'submit' | 'cancel' | 'custom';
  label: string;
  position: 'start' | 'end';
  handler?: string; // JavaScript code or workflow ID
  style?: 'primary' | 'secondary' | 'accent' | 'warn';
}

export interface Workflow {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  trigger: WorkflowTrigger;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'webhook' | 'manual';
  config: any;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  action: 'create' | 'read' | 'update' | 'delete' | 'all';
  subject: string;
  conditions?: any;
  fields?: string[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiToken {
  id: string;
  name: string;
  token: string;
  scopes: string[];
  expiresAt?: string;
  createdAt: string;
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  enabled: boolean;
  settings?: any;
}

export interface SystemSettings {
  id: string;
  appName: string;
  logo?: string;
  theme?: string;
  locale?: string;
  dateFormat?: string;
  timeFormat?: string;
  defaultRole?: string;
  plugins?: string[];
}
