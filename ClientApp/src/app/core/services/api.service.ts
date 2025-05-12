import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  Schema,
  Collection,
  FormConfig,
  Workflow,
  Role,
  User,
  ApiToken,
  Plugin,
  SystemSettings
} from '@core/models/schema.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Schema Management
  getSchemas(): Observable<Schema[]> {
    return this.http.get<Schema[]>(`${this.baseUrl}/api/schemas`);
  }

  getSchema(id: string): Observable<Schema> {
    return this.http.get<Schema>(`${this.baseUrl}/api/schemas/${id}`);
  }

  createSchema(schema: Partial<Schema>): Observable<Schema> {
    return this.http.post<Schema>(`${this.baseUrl}/api/schemas`, schema);
  }

  updateSchema(id: string, schema: Partial<Schema>): Observable<Schema> {
    return this.http.put<Schema>(`${this.baseUrl}/api/schemas/${id}`, schema);
  }

  deleteSchema(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/schemas/${id}`);
  }

  // Collection Management
  getCollections(schemaId: string): Observable<Collection[]> {
    return this.http.get<Collection[]>(`${this.baseUrl}/api/schemas/${schemaId}/collections`);
  }

  getCollection(schemaId: string, id: string): Observable<Collection> {
    return this.http.get<Collection>(`${this.baseUrl}/api/schemas/${schemaId}/collections/${id}`);
  }

  createCollection(schemaId: string, collection: Partial<Collection>): Observable<Collection> {
    return this.http.post<Collection>(`${this.baseUrl}/api/schemas/${schemaId}/collections`, collection);
  }

  updateCollection(schemaId: string, id: string, collection: Partial<Collection>): Observable<Collection> {
    return this.http.put<Collection>(`${this.baseUrl}/api/schemas/${schemaId}/collections/${id}`, collection);
  }

  deleteCollection(schemaId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/schemas/${schemaId}/collections/${id}`);
  }

  // Form Management
  getForms(): Observable<FormConfig[]> {
    return this.http.get<FormConfig[]>(`${this.baseUrl}/api/forms`);
  }

  getForm(id: string): Observable<FormConfig> {
    return this.http.get<FormConfig>(`${this.baseUrl}/api/forms/${id}`);
  }

  createForm(form: Partial<FormConfig>): Observable<FormConfig> {
    return this.http.post<FormConfig>(`${this.baseUrl}/api/forms`, form);
  }

  updateForm(id: string, form: Partial<FormConfig>): Observable<FormConfig> {
    return this.http.put<FormConfig>(`${this.baseUrl}/api/forms/${id}`, form);
  }

  deleteForm(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/forms/${id}`);
  }

  // Workflow Management
  getWorkflows(): Observable<Workflow[]> {
    return this.http.get<Workflow[]>(`${this.baseUrl}/api/workflows`);
  }

  getWorkflow(id: string): Observable<Workflow> {
    return this.http.get<Workflow>(`${this.baseUrl}/api/workflows/${id}`);
  }

  createWorkflow(workflow: Partial<Workflow>): Observable<Workflow> {
    return this.http.post<Workflow>(`${this.baseUrl}/api/workflows`, workflow);
  }

  updateWorkflow(id: string, workflow: Partial<Workflow>): Observable<Workflow> {
    return this.http.put<Workflow>(`${this.baseUrl}/api/workflows/${id}`, workflow);
  }

  deleteWorkflow(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/workflows/${id}`);
  }

  // Data Management
  getData(collectionName: string, params?: any): Observable<any[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get<any[]>(`${this.baseUrl}/api/data/${collectionName}`, { params: httpParams });
  }

  getDataById(collectionName: string, id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/data/${collectionName}/${id}`);
  }

  createData(collectionName: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/data/${collectionName}`, data);
  }

  updateData(collectionName: string, id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/data/${collectionName}/${id}`, data);
  }

  deleteData(collectionName: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/data/${collectionName}/${id}`);
  }

  // Role Management
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}/api/roles`);
  }

  getRole(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/api/roles/${id}`);
  }

  createRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(`${this.baseUrl}/api/roles`, role);
  }

  updateRole(id: string, role: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.baseUrl}/api/roles/${id}`, role);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/roles/${id}`);
  }

  // User Management
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/api/users`);
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/api/users/${id}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/api/users`, user);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/api/users/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/users/${id}`);
  }

  // System Settings
  getSettings(): Observable<SystemSettings> {
    return this.http.get<SystemSettings>(`${this.baseUrl}/api/settings`);
  }

  updateSettings(settings: Partial<SystemSettings>): Observable<SystemSettings> {
    return this.http.put<SystemSettings>(`${this.baseUrl}/api/settings`, settings);
  }

  // Plugin Management
  getPlugins(): Observable<Plugin[]> {
    return this.http.get<Plugin[]>(`${this.baseUrl}/api/plugins`);
  }

  getPlugin(id: string): Observable<Plugin> {
    return this.http.get<Plugin>(`${this.baseUrl}/api/plugins/${id}`);
  }

  enablePlugin(id: string): Observable<Plugin> {
    return this.http.post<Plugin>(`${this.baseUrl}/api/plugins/${id}/enable`, {});
  }

  disablePlugin(id: string): Observable<Plugin> {
    return this.http.post<Plugin>(`${this.baseUrl}/api/plugins/${id}/disable`, {});
  }

  updatePluginSettings(id: string, settings: any): Observable<Plugin> {
    return this.http.put<Plugin>(`${this.baseUrl}/api/plugins/${id}/settings`, settings);
  }

  // API Token Management
  getApiTokens(): Observable<ApiToken[]> {
    return this.http.get<ApiToken[]>(`${this.baseUrl}/api/tokens`);
  }

  createApiToken(token: Partial<ApiToken>): Observable<ApiToken> {
    return this.http.post<ApiToken>(`${this.baseUrl}/api/tokens`, token);
  }

  deleteApiToken(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/tokens/${id}`);
  }
}
