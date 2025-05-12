using NocoStudio.Core.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NocoStudio.Core.Interfaces
{
    public interface ISchemaService
    {
        Task<IEnumerable<Schema>> GetSchemasAsync();
        Task<Schema?> GetSchemaByIdAsync(string id);
        Task<Schema> CreateSchemaAsync(Schema schema);
        Task<Schema> UpdateSchemaAsync(Schema schema);
        Task DeleteSchemaAsync(string id);
        Task<Collection> AddCollectionAsync(string schemaId, Collection collection);
        Task<Collection> UpdateCollectionAsync(string schemaId, Collection collection);
        Task DeleteCollectionAsync(string schemaId, string collectionId);
    }

    public interface IFormService
    {
        Task<IEnumerable<FormConfig>> GetFormsAsync();
        Task<FormConfig?> GetFormByIdAsync(string id);
        Task<FormConfig> CreateFormAsync(FormConfig form);
        Task<FormConfig> UpdateFormAsync(FormConfig form);
        Task DeleteFormAsync(string id);
        Task<object> SubmitFormAsync(string id, Dictionary<string, object> formData);
        Task<object> RenderFormAsync(string id);
    }

    public interface IWorkflowService
    {
        Task<IEnumerable<Workflow>> GetWorkflowsAsync();
        Task<Workflow?> GetWorkflowByIdAsync(string id);
        Task<Workflow> CreateWorkflowAsync(Workflow workflow);
        Task<Workflow> UpdateWorkflowAsync(Workflow workflow);
        Task DeleteWorkflowAsync(string id);
        Task<WorkflowExecution> ExecuteWorkflowAsync(string id, Dictionary<string, object> data);
        Task<IEnumerable<WorkflowExecution>> GetWorkflowHistoryAsync(string id);
        Task<Workflow> ToggleWorkflowStateAsync(string id);
    }

    public interface IRoleService
    {
        Task<IEnumerable<Role>> GetRolesAsync();
        Task<Role?> GetRoleByIdAsync(string id);
        Task<Role> CreateRoleAsync(Role role);
        Task<Role> UpdateRoleAsync(Role role);
        Task DeleteRoleAsync(string id);
        Task<IEnumerable<User>> GetUsersInRoleAsync(string roleId);
        Task AddUserToRoleAsync(string userId, string roleId);
        Task RemoveUserFromRoleAsync(string userId, string roleId);
    }

    public interface IUserService
    {
        Task<IEnumerable<User>> GetUsersAsync();
        Task<User?> GetUserByIdAsync(string id);
        Task<User> CreateUserAsync(User user, string password);
        Task<User> UpdateUserAsync(User user);
        Task DeleteUserAsync(string id);
        Task<bool> ChangePasswordAsync(string id, string currentPassword, string newPassword);
    }

    public interface IAuthService
    {
        Task<User?> ValidateUserAsync(string username, string password);
        Task<User> RegisterUserAsync(object registerRequest);
        Task<User?> GetUserByIdAsync(string id);
        Task<bool> UsernameExistsAsync(string username);
        Task<bool> EmailExistsAsync(string email);
    }

    public interface IDataService
    {
        Task<IEnumerable<dynamic>> GetDataAsync(string collectionName, Dictionary<string, string>? queryParams = null);
        Task<dynamic?> GetDataByIdAsync(string collectionName, string id);
        Task<dynamic> CreateDataAsync(string collectionName, dynamic data);
        Task<dynamic> UpdateDataAsync(string collectionName, string id, dynamic data);
        Task DeleteDataAsync(string collectionName, string id);
        Task<IEnumerable<dynamic>> BulkCreateDataAsync(string collectionName, IEnumerable<dynamic> data);
        Task<object> ImportDataAsync(string collectionName, Microsoft.AspNetCore.Http.IFormFile file);
        Task<(byte[] fileContent, string contentType, string fileName)> ExportDataAsync(string collectionName, string format);
    }

    public interface ISchemaRepository
    {
        Task<IEnumerable<Schema>> GetAllAsync();
        Task<Schema?> GetByIdAsync(string id);
        Task<Schema> AddAsync(Schema schema);
        Task<Schema> UpdateAsync(Schema schema);
        Task DeleteAsync(string id);
    }

    public interface IFormRepository
    {
        Task<IEnumerable<FormConfig>> GetAllAsync();
        Task<FormConfig?> GetByIdAsync(string id);
        Task<FormConfig> AddAsync(FormConfig form);
        Task<FormConfig> UpdateAsync(FormConfig form);
        Task DeleteAsync(string id);
        Task<FormSubmission> AddSubmissionAsync(FormSubmission submission);
    }

    public interface IWorkflowRepository
    {
        Task<IEnumerable<Workflow>> GetAllAsync();
        Task<Workflow?> GetByIdAsync(string id);
        Task<Workflow> AddAsync(Workflow workflow);
        Task<Workflow> UpdateAsync(Workflow workflow);
        Task DeleteAsync(string id);
        Task<WorkflowExecution> AddExecutionAsync(WorkflowExecution execution);
        Task<WorkflowExecution> UpdateExecutionAsync(WorkflowExecution execution);
        Task<IEnumerable<WorkflowExecution>> GetExecutionsByWorkflowIdAsync(string workflowId);
    }

    public interface IRoleRepository
    {
        Task<IEnumerable<Role>> GetAllAsync();
        Task<Role?> GetByIdAsync(string id);
        Task<Role> AddAsync(Role role);
        Task<Role> UpdateAsync(Role role);
        Task DeleteAsync(string id);
    }

    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllAsync();
        Task<User?> GetByIdAsync(string id);
        Task<User?> GetByUsernameAsync(string username);
        Task<User?> GetByEmailAsync(string email);
        Task<User> AddAsync(User user);
        Task<User> UpdateAsync(User user);
        Task DeleteAsync(string id);
    }
}
