using NocoStudio.Core.Interfaces;
using NocoStudio.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NocoStudio.Core.Services
{
    public class SchemaService : ISchemaService
    {
        private readonly ISchemaRepository _schemaRepository;

        public SchemaService(ISchemaRepository schemaRepository)
        {
            _schemaRepository = schemaRepository;
        }

        public async Task<IEnumerable<Schema>> GetSchemasAsync()
        {
            return await _schemaRepository.GetAllAsync();
        }

        public async Task<Schema?> GetSchemaByIdAsync(string id)
        {
            return await _schemaRepository.GetByIdAsync(id);
        }

        public async Task<Schema> CreateSchemaAsync(Schema schema)
        {
            // Validate schema
            ValidateSchema(schema);

            // Set created/updated dates
            schema.CreatedAt = DateTime.UtcNow;
            schema.UpdatedAt = DateTime.UtcNow;

            return await _schemaRepository.AddAsync(schema);
        }

        public async Task<Schema> UpdateSchemaAsync(Schema schema)
        {
            // Validate schema
            ValidateSchema(schema);

            // Get existing schema
            var existingSchema = await _schemaRepository.GetByIdAsync(schema.Id);
            if (existingSchema == null)
            {
                throw new KeyNotFoundException($"Schema with ID {schema.Id} not found");
            }

            // Update timestamp
            schema.CreatedAt = existingSchema.CreatedAt;
            schema.UpdatedAt = DateTime.UtcNow;

            return await _schemaRepository.UpdateAsync(schema);
        }

        public async Task DeleteSchemaAsync(string id)
        {
            var schema = await _schemaRepository.GetByIdAsync(id);
            if (schema == null)
            {
                throw new KeyNotFoundException($"Schema with ID {id} not found");
            }

            await _schemaRepository.DeleteAsync(id);
        }

        public async Task<Collection> AddCollectionAsync(string schemaId, Collection collection)
        {
            var schema = await _schemaRepository.GetByIdAsync(schemaId);
            if (schema == null)
            {
                throw new KeyNotFoundException($"Schema with ID {schemaId} not found");
            }

            // Validate collection
            ValidateCollection(collection);

            // Check for duplicate collection name
            if (schema.Collections.Any(c => c.Name == collection.Name))
            {
                throw new InvalidOperationException($"Collection with name '{collection.Name}' already exists in this schema");
            }

            // Add collection to schema
            schema.Collections.Add(collection);
            schema.UpdatedAt = DateTime.UtcNow;

            // Update schema
            await _schemaRepository.UpdateAsync(schema);

            return collection;
        }

        public async Task<Collection> UpdateCollectionAsync(string schemaId, Collection collection)
        {
            var schema = await _schemaRepository.GetByIdAsync(schemaId);
            if (schema == null)
            {
                throw new KeyNotFoundException($"Schema with ID {schemaId} not found");
            }

            // Validate collection
            ValidateCollection(collection);

            // Find existing collection
            var existingCollectionIndex = schema.Collections.FindIndex(c => c.Id == collection.Id);
            if (existingCollectionIndex == -1)
            {
                throw new KeyNotFoundException($"Collection with ID {collection.Id} not found in schema");
            }

            // Check for duplicate collection name (except self)
            if (schema.Collections.Any(c => c.Name == collection.Name && c.Id != collection.Id))
            {
                throw new InvalidOperationException($"Collection with name '{collection.Name}' already exists in this schema");
            }

            // Update collection
            schema.Collections[existingCollectionIndex] = collection;
            schema.UpdatedAt = DateTime.UtcNow;

            // Update schema
            await _schemaRepository.UpdateAsync(schema);

            return collection;
        }

        public async Task DeleteCollectionAsync(string schemaId, string collectionId)
        {
            var schema = await _schemaRepository.GetByIdAsync(schemaId);
            if (schema == null)
            {
                throw new KeyNotFoundException($"Schema with ID {schemaId} not found");
            }

            // Find existing collection
            var existingCollectionIndex = schema.Collections.FindIndex(c => c.Id == collectionId);
            if (existingCollectionIndex == -1)
            {
                throw new KeyNotFoundException($"Collection with ID {collectionId} not found in schema");
            }

            // Remove collection
            schema.Collections.RemoveAt(existingCollectionIndex);
            schema.UpdatedAt = DateTime.UtcNow;

            // Update schema
            await _schemaRepository.UpdateAsync(schema);
        }

        private void ValidateSchema(Schema schema)
        {
            if (string.IsNullOrWhiteSpace(schema.Name))
            {
                throw new ArgumentException("Schema name is required");
            }

            if (string.IsNullOrWhiteSpace(schema.DisplayName))
            {
                throw new ArgumentException("Schema display name is required");
            }

            // Name format validation (lowercase, alphanumeric, underscore)
            if (!System.Text.RegularExpressions.Regex.IsMatch(schema.Name, "^[a-z0-9_]+$"))
            {
                throw new ArgumentException("Schema name can only contain lowercase letters, numbers, and underscores");
            }

            // Validate each collection
            foreach (var collection in schema.Collections)
            {
                ValidateCollection(collection);
            }
        }

        private void ValidateCollection(Collection collection)
        {
            if (string.IsNullOrWhiteSpace(collection.Name))
            {
                throw new ArgumentException("Collection name is required");
            }

            if (string.IsNullOrWhiteSpace(collection.DisplayName))
            {
                throw new ArgumentException("Collection display name is required");
            }

            // Name format validation (lowercase, alphanumeric, underscore)
            if (!System.Text.RegularExpressions.Regex.IsMatch(collection.Name, "^[a-z0-9_]+$"))
            {
                throw new ArgumentException("Collection name can only contain lowercase letters, numbers, and underscores");
            }

            // Validate each field
            foreach (var field in collection.Fields)
            {
                ValidateField(field);
            }

            // Check for duplicate field names
            var fieldNames = collection.Fields.Select(f => f.Name).ToList();
            var duplicateFieldNames = fieldNames.GroupBy(x => x).Where(g => g.Count() > 1).Select(g => g.Key).ToList();
            if (duplicateFieldNames.Any())
            {
                throw new ArgumentException($"Duplicate field names found: {string.Join(", ", duplicateFieldNames)}");
            }
        }

        private void ValidateField(Field field)
        {
            if (string.IsNullOrWhiteSpace(field.Name))
            {
                throw new ArgumentException("Field name is required");
            }

            if (string.IsNullOrWhiteSpace(field.DisplayName))
            {
                throw new ArgumentException("Field display name is required");
            }

            // Name format validation (lowercase, alphanumeric, underscore)
            if (!System.Text.RegularExpressions.Regex.IsMatch(field.Name, "^[a-z0-9_]+$"))
            {
                throw new ArgumentException($"Field name '{field.Name}' can only contain lowercase letters, numbers, and underscores");
            }

            // Validate relation field
            if (field.Type == FieldType.Relation && field is RelationField relationField)
            {
                if (string.IsNullOrWhiteSpace(relationField.TargetCollection))
                {
                    throw new ArgumentException($"Target collection is required for relation field '{field.Name}'");
                }
            }

            // Validate enum field
            if (field.Type == FieldType.Enum && (field.Options == null || !field.Options.Any()))
            {
                throw new ArgumentException($"Options are required for enum field '{field.Name}'");
            }
        }
    }

    public class FormService : IFormService
    {
        private readonly IFormRepository _formRepository;
        private readonly ISchemaRepository _schemaRepository;

        public FormService(IFormRepository formRepository, ISchemaRepository schemaRepository)
        {
            _formRepository = formRepository;
            _schemaRepository = schemaRepository;
        }

        public async Task<IEnumerable<FormConfig>> GetFormsAsync()
        {
            return await _formRepository.GetAllAsync();
        }

        public async Task<FormConfig?> GetFormByIdAsync(string id)
        {
            return await _formRepository.GetByIdAsync(id);
        }

        public async Task<FormConfig> CreateFormAsync(FormConfig form)
        {
            // Validate form
            await ValidateFormAsync(form);

            // Set created/updated dates
            form.CreatedAt = DateTime.UtcNow;
            form.UpdatedAt = DateTime.UtcNow;

            return await _formRepository.AddAsync(form);
        }

        public async Task<FormConfig> UpdateFormAsync(FormConfig form)
        {
            // Validate form
            await ValidateFormAsync(form);

            // Get existing form
            var existingForm = await _formRepository.GetByIdAsync(form.Id);
            if (existingForm == null)
            {
                throw new KeyNotFoundException($"Form with ID {form.Id} not found");
            }

            // Update timestamp
            form.CreatedAt = existingForm.CreatedAt;
            form.UpdatedAt = DateTime.UtcNow;

            return await _formRepository.UpdateAsync(form);
        }

        public async Task DeleteFormAsync(string id)
        {
            var form = await _formRepository.GetByIdAsync(id);
            if (form == null)
            {
                throw new KeyNotFoundException($"Form with ID {id} not found");
            }

            await _formRepository.DeleteAsync(id);
        }

        public async Task<object> SubmitFormAsync(string id, Dictionary<string, object> formData)
        {
            var form = await _formRepository.GetByIdAsync(id);
            if (form == null)
            {
                throw new KeyNotFoundException($"Form with ID {id} not found");
            }

            // Create form submission
            var submission = new FormSubmission
            {
                FormId = id,
                Data = formData,
                Status = "completed",
                CreatedAt = DateTime.UtcNow
            };

            await _formRepository.AddSubmissionAsync(submission);

            return submission;
        }

        public async Task<object> RenderFormAsync(string id)
        {
            var form = await _formRepository.GetByIdAsync(id);
            if (form == null)
            {
                throw new KeyNotFoundException($"Form with ID {id} not found");
            }

            // In a real implementation, this would generate the form UI configuration
            // For now, we'll just return the form itself
            return form;
        }

        private async Task ValidateFormAsync(FormConfig form)
        {
            if (string.IsNullOrWhiteSpace(form.Name))
            {
                throw new ArgumentException("Form name is required");
            }

            if (string.IsNullOrWhiteSpace(form.DisplayName))
            {
                throw new ArgumentException("Form display name is required");
            }

            if (string.IsNullOrWhiteSpace(form.Collection))
            {
                throw new ArgumentException("Collection is required");
            }

            // Name format validation (lowercase, alphanumeric, underscore)
            if (!System.Text.RegularExpressions.Regex.IsMatch(form.Name, "^[a-z0-9_]+$"))
            {
                throw new ArgumentException("Form name can only contain lowercase letters, numbers, and underscores");
            }

            // Check if collection exists
            var schemas = await _schemaRepository.GetAllAsync();
            var allCollections = schemas.SelectMany(s => s.Collections).ToList();
            var collectionExists = allCollections.Any(c => c.Name == form.Collection);

            if (!collectionExists)
            {
                throw new ArgumentException($"Collection '{form.Collection}' does not exist");
            }
        }
    }

    public class WorkflowService : IWorkflowService
    {
        private readonly IWorkflowRepository _workflowRepository;

        public WorkflowService(IWorkflowRepository workflowRepository)
        {
            _workflowRepository = workflowRepository;
        }

        public async Task<IEnumerable<Workflow>> GetWorkflowsAsync()
        {
            return await _workflowRepository.GetAllAsync();
        }

        public async Task<Workflow?> GetWorkflowByIdAsync(string id)
        {
            return await _workflowRepository.GetByIdAsync(id);
        }

        public async Task<Workflow> CreateWorkflowAsync(Workflow workflow)
        {
            // Validate workflow
            ValidateWorkflow(workflow);

            // Set created/updated dates
            workflow.CreatedAt = DateTime.UtcNow;
            workflow.UpdatedAt = DateTime.UtcNow;

            return await _workflowRepository.AddAsync(workflow);
        }

        public async Task<Workflow> UpdateWorkflowAsync(Workflow workflow)
        {
            // Validate workflow
            ValidateWorkflow(workflow);

            // Get existing workflow
            var existingWorkflow = await _workflowRepository.GetByIdAsync(workflow.Id);
            if (existingWorkflow == null)
            {
                throw new KeyNotFoundException($"Workflow with ID {workflow.Id} not found");
            }

            // Update timestamp
            workflow.CreatedAt = existingWorkflow.CreatedAt;
            workflow.UpdatedAt = DateTime.UtcNow;

            return await _workflowRepository.UpdateAsync(workflow);
        }

        public async Task DeleteWorkflowAsync(string id)
        {
            var workflow = await _workflowRepository.GetByIdAsync(id);
            if (workflow == null)
            {
                throw new KeyNotFoundException($"Workflow with ID {id} not found");
            }

            await _workflowRepository.DeleteAsync(id);
        }

        public async Task<WorkflowExecution> ExecuteWorkflowAsync(string id, Dictionary<string, object> data)
        {
            var workflow = await _workflowRepository.GetByIdAsync(id);
            if (workflow == null)
            {
                throw new KeyNotFoundException($"Workflow with ID {id} not found");
            }

            if (!workflow.Active)
            {
                throw new InvalidOperationException("Cannot execute an inactive workflow");
            }

            // Create workflow execution
            var execution = new WorkflowExecution
            {
                WorkflowId = id,
                Status = "completed",
                Input = data,
                Output = new Dictionary<string, object>(),
                StartedAt = DateTime.UtcNow,
                CompletedAt = DateTime.UtcNow
            };

            // In a real implementation, this would execute the workflow logic
            // For now, we'll just save the execution record

            return await _workflowRepository.AddExecutionAsync(execution);
        }

        public async Task<IEnumerable<WorkflowExecution>> GetWorkflowHistoryAsync(string id)
        {
            var workflow = await _workflowRepository.GetByIdAsync(id);
            if (workflow == null)
            {
                throw new KeyNotFoundException($"Workflow with ID {id} not found");
            }

            return await _workflowRepository.GetExecutionsByWorkflowIdAsync(id);
        }

        public async Task<Workflow> ToggleWorkflowStateAsync(string id)
        {
            var workflow = await _workflowRepository.GetByIdAsync(id);
            if (workflow == null)
            {
                throw new KeyNotFoundException($"Workflow with ID {id} not found");
            }

            workflow.Active = !workflow.Active;
            workflow.UpdatedAt = DateTime.UtcNow;

            return await _workflowRepository.UpdateAsync(workflow);
        }

        private void ValidateWorkflow(Workflow workflow)
        {
            if (string.IsNullOrWhiteSpace(workflow.Name))
            {
                throw new ArgumentException("Workflow name is required");
            }

            if (string.IsNullOrWhiteSpace(workflow.DisplayName))
            {
                throw new ArgumentException("Workflow display name is required");
            }

            // Name format validation (lowercase, alphanumeric, underscore)
            if (!System.Text.RegularExpressions.Regex.IsMatch(workflow.Name, "^[a-z0-9_]+$"))
            {
                throw new ArgumentException("Workflow name can only contain lowercase letters, numbers, and underscores");
            }

            // Ensure there's at least one trigger node
            var hasTriggerNode = workflow.Nodes.Any(n => n.Type == "trigger");
            if (!hasTriggerNode)
            {
                throw new ArgumentException("Workflow must have at least one trigger node");
            }

            // Validate edges reference existing nodes
            foreach (var edge in workflow.Edges)
            {
                var sourceNodeExists = workflow.Nodes.Any(n => n.Id == edge.Source);
                var targetNodeExists = workflow.Nodes.Any(n => n.Id == edge.Target);

                if (!sourceNodeExists)
                {
                    throw new ArgumentException($"Edge source node with ID {edge.Source} does not exist");
                }

                if (!targetNodeExists)
                {
                    throw new ArgumentException($"Edge target node with ID {edge.Target} does not exist");
                }
            }
        }
    }

    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _roleRepository;
        private readonly IUserRepository _userRepository;

        public RoleService(IRoleRepository roleRepository, IUserRepository userRepository)
        {
            _roleRepository = roleRepository;
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<Role>> GetRolesAsync()
        {
            return await _roleRepository.GetAllAsync();
        }

        public async Task<Role?> GetRoleByIdAsync(string id)
        {
            return await _roleRepository.GetByIdAsync(id);
        }

        public async Task<Role> CreateRoleAsync(Role role)
        {
            // Validate role
            ValidateRole(role);

            // Set created/updated dates
            role.CreatedAt = DateTime.UtcNow;
            role.UpdatedAt = DateTime.UtcNow;

            return await _roleRepository.AddAsync(role);
        }

        public async Task<Role> UpdateRoleAsync(Role role)
        {
            // Validate role
            ValidateRole(role);

            // Get existing role
            var existingRole = await _roleRepository.GetByIdAsync(role.Id);
            if (existingRole == null)
            {
                throw new KeyNotFoundException($"Role with ID {role.Id} not found");
            }

            // Update timestamp
            role.CreatedAt = existingRole.CreatedAt;
            role.UpdatedAt = DateTime.UtcNow;

            return await _roleRepository.UpdateAsync(role);
        }

        public async Task DeleteRoleAsync(string id)
        {
            var role = await _roleRepository.GetByIdAsync(id);
            if (role == null)
            {
                throw new KeyNotFoundException($"Role with ID {id} not found");
            }

            // Check if any users have this role
            var users = await _userRepository.GetAllAsync();
            var usersWithRole = users.Where(u => u.Roles.Contains(id)).ToList();

            if (usersWithRole.Any())
            {
                throw new InvalidOperationException($"Cannot delete role '{role.Name}' because it is assigned to {usersWithRole.Count} users");
            }

            await _roleRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<User>> GetUsersInRoleAsync(string roleId)
        {
            var role = await _roleRepository.GetByIdAsync(roleId);
            if (role == null)
            {
                throw new KeyNotFoundException($"Role with ID {roleId} not found");
            }

            var users = await _userRepository.GetAllAsync();
            return users.Where(u => u.Roles.Contains(roleId)).ToList();
        }

        public async Task AddUserToRoleAsync(string userId, string roleId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {userId} not found");
            }

            var role = await _roleRepository.GetByIdAsync(roleId);
            if (role == null)
            {
                throw new KeyNotFoundException($"Role with ID {roleId} not found");
            }

            if (!user.Roles.Contains(roleId))
            {
                user.Roles.Add(roleId);
                user.UpdatedAt = DateTime.UtcNow;
                await _userRepository.UpdateAsync(user);
            }
        }

        public async Task RemoveUserFromRoleAsync(string userId, string roleId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {userId} not found");
            }

            var role = await _roleRepository.GetByIdAsync(roleId);
            if (role == null)
            {
                throw new KeyNotFoundException($"Role with ID {roleId} not found");
            }

            if (user.Roles.Contains(roleId))
            {
                user.Roles.Remove(roleId);
                user.UpdatedAt = DateTime.UtcNow;
                await _userRepository.UpdateAsync(user);
            }
        }

        private void ValidateRole(Role role)
        {
            if (string.IsNullOrWhiteSpace(role.Name))
            {
                throw new ArgumentException("Role name is required");
            }

            if (string.IsNullOrWhiteSpace(role.DisplayName))
            {
                throw new ArgumentException("Role display name is required");
            }

            // Name format validation (lowercase, alphanumeric, underscore)
            if (!System.Text.RegularExpressions.Regex.IsMatch(role.Name, "^[a-z0-9_]+$"))
            {
                throw new ArgumentException("Role name can only contain lowercase letters, numbers, and underscores");
            }

            // Validate permissions
            foreach (var permission in role.Permissions)
            {
                if (string.IsNullOrWhiteSpace(permission.Subject))
                {
                    throw new ArgumentException("Permission subject is required");
                }
            }
        }
    }

    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<User>> GetUsersAsync()
        {
            return await _userRepository.GetAllAsync();
        }

        public async Task<User?> GetUserByIdAsync(string id)
        {
            return await _userRepository.GetByIdAsync(id);
        }

        public async Task<User> CreateUserAsync(User user, string password)
        {
            // Validate user
            await ValidateUserAsync(user);

            // Hash password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);

            // Set created/updated dates
            user.CreatedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;

            return await _userRepository.AddAsync(user);
        }

        public async Task<User> UpdateUserAsync(User user)
        {
            // Validate user
            await ValidateUserForUpdateAsync(user);

            // Get existing user
            var existingUser = await _userRepository.GetByIdAsync(user.Id);
            if (existingUser == null)
            {
                throw new KeyNotFoundException($"User with ID {user.Id} not found");
            }

            // Preserve password hash
            user.PasswordHash = existingUser.PasswordHash;

            // Update timestamp
            user.CreatedAt = existingUser.CreatedAt;
            user.UpdatedAt = DateTime.UtcNow;

            return await _userRepository.UpdateAsync(user);
        }

        public async Task DeleteUserAsync(string id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {id} not found");
            }

            await _userRepository.DeleteAsync(id);
        }

        public async Task<bool> ChangePasswordAsync(string id, string currentPassword, string newPassword)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {id} not found");
            }

            // Verify current password
            if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
            {
                return false;
            }

            // Update password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
            return true;
        }

        private async Task ValidateUserAsync(User user)
        {
            if (string.IsNullOrWhiteSpace(user.Username))
            {
                throw new ArgumentException("Username is required");
            }

            if (string.IsNullOrWhiteSpace(user.Email))
            {
                throw new ArgumentException("Email is required");
            }

            // Username format validation (alphanumeric, underscore)
            if (!System.Text.RegularExpressions.Regex.IsMatch(user.Username, "^[a-zA-Z0-9_]+$"))
            {
                throw new ArgumentException("Username can only contain letters, numbers, and underscores");
            }

            // Email format validation
            if (!System.Text.RegularExpressions.Regex.IsMatch(user.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            {
                throw new ArgumentException("Invalid email format");
            }

            // Check for duplicate username
            var existingUserWithUsername = await _userRepository.GetByUsernameAsync(user.Username);
            if (existingUserWithUsername != null)
            {
                throw new InvalidOperationException($"Username '{user.Username}' is already taken");
            }

            // Check for duplicate email
            var existingUserWithEmail = await _userRepository.GetByEmailAsync(user.Email);
            if (existingUserWithEmail != null)
            {
                throw new InvalidOperationException($"Email '{user.Email}' is already in use");
            }
        }

        private async Task ValidateUserForUpdateAsync(User user)
        {
            if (string.IsNullOrWhiteSpace(user.Username))
            {
                throw new ArgumentException("Username is required");
            }

            if (string.IsNullOrWhiteSpace(user.Email))
            {
                throw new ArgumentException("Email is required");
            }

            // Username format validation (alphanumeric, underscore)
            if (!System.Text.RegularExpressions.Regex.IsMatch(user.Username, "^[a-zA-Z0-9_]+$"))
            {
                throw new ArgumentException("Username can only contain letters, numbers, and underscores");
            }

            // Email format validation
            if (!System.Text.RegularExpressions.Regex.IsMatch(user.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            {
                throw new ArgumentException("Invalid email format");
            }

            // Check for existing user
            var existingUser = await _userRepository.GetByIdAsync(user.Id);
            if (existingUser == null)
            {
                throw new KeyNotFoundException($"User with ID {user.Id} not found");
            }

            // Check for duplicate username (exclude current user)
            var existingUserWithUsername = await _userRepository.GetByUsernameAsync(user.Username);
            if (existingUserWithUsername != null && existingUserWithUsername.Id != user.Id)
            {
                throw new InvalidOperationException($"Username '{user.Username}' is already taken");
            }

            // Check for duplicate email (exclude current user)
            var existingUserWithEmail = await _userRepository.GetByEmailAsync(user.Email);
            if (existingUserWithEmail != null && existingUserWithEmail.Id != user.Id)
            {
                throw new InvalidOperationException($"Email '{user.Email}' is already in use");
            }
        }
    }

    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;

        public AuthService(IUserRepository userRepository, IRoleRepository roleRepository)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
        }

        public async Task<User?> ValidateUserAsync(string username, string password)
        {
            var user = await _userRepository.GetByUsernameAsync(username);

            if (user == null || !user.Active)
            {
                return null;
            }

            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                return null;
            }

            return user;
        }

        public async Task<User> RegisterUserAsync(object registerRequest)
        {
            // Cast to dynamic to access properties
            dynamic request = registerRequest;

            // Create new user
            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Active = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Check for duplicate username
            if (await UsernameExistsAsync(user.Username))
            {
                throw new InvalidOperationException($"Username '{user.Username}' is already taken");
            }

            // Check for duplicate email
            if (await EmailExistsAsync(user.Email))
            {
                throw new InvalidOperationException($"Email '{user.Email}' is already in use");
            }

            // Hash password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Add default role if available
            var roles = await _roleRepository.GetAllAsync();
            var defaultRole = roles.FirstOrDefault(r => r.Name == "user");
            if (defaultRole != null)
            {
                user.Roles.Add(defaultRole.Id);
            }

            return await _userRepository.AddAsync(user);
        }

        public async Task<User?> GetUserByIdAsync(string id)
        {
            return await _userRepository.GetByIdAsync(id);
        }

        public async Task<bool> UsernameExistsAsync(string username)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            return user != null;
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            return user != null;
        }
    }

    public class DataService : IDataService
    {
        private readonly ISchemaRepository _schemaRepository;

        public DataService(ISchemaRepository schemaRepository)
        {
            _schemaRepository = schemaRepository;
        }

        public async Task<IEnumerable<dynamic>> GetDataAsync(string collectionName, Dictionary<string, string>? queryParams = null)
        {
            // In a real implementation, this would query the database
            // For now, return empty list
            return new List<dynamic>();
        }

        public async Task<dynamic?> GetDataByIdAsync(string collectionName, string id)
        {
            // In a real implementation, this would query the database
            // For now, return null
            return null;
        }

        public async Task<dynamic> CreateDataAsync(string collectionName, dynamic data)
        {
            // In a real implementation, this would insert data into the database
            // For now, just return the data with an ID
            var id = Guid.NewGuid().ToString();
            var result = new System.Dynamic.ExpandoObject();
            ((IDictionary<string, object>)result)["id"] = id;
            
            // Add all properties from data
            foreach (var prop in (IDictionary<string, object>)data)
            {
                ((IDictionary<string, object>)result)[prop.Key] = prop.Value;
            }

            return result;
        }

        public async Task<dynamic> UpdateDataAsync(string collectionName, string id, dynamic data)
        {
            // In a real implementation, this would update data in the database
            // For now, just return the data with the ID
            var result = new System.Dynamic.ExpandoObject();
            ((IDictionary<string, object>)result)["id"] = id;
            
            // Add all properties from data
            foreach (var prop in (IDictionary<string, object>)data)
            {
                ((IDictionary<string, object>)result)[prop.Key] = prop.Value;
            }

            return result;
        }

        public async Task DeleteDataAsync(string collectionName, string id)
        {
            // In a real implementation, this would delete data from the database
        }

        public async Task<IEnumerable<dynamic>> BulkCreateDataAsync(string collectionName, IEnumerable<dynamic> data)
        {
            // In a real implementation, this would bulk insert data into the database
            // For now, just return the data with IDs
            var results = new List<dynamic>();
            
            foreach (var item in data)
            {
                var id = Guid.NewGuid().ToString();
                var result = new System.Dynamic.ExpandoObject();
                ((IDictionary<string, object>)result)["id"] = id;
                
                // Add all properties from item
                foreach (var prop in (IDictionary<string, object>)item)
                {
                    ((IDictionary<string, object>)result)[prop.Key] = prop.Value;
                }
                
                results.Add(result);
            }

            return results;
        }

        public async Task<object> ImportDataAsync(string collectionName, Microsoft.AspNetCore.Http.IFormFile file)
        {
            // In a real implementation, this would parse the file and import data
            // For now, return a success message
            return new { message = "Import successful", rowsImported = 0 };
        }

        public async Task<(byte[] fileContent, string contentType, string fileName)> ExportDataAsync(string collectionName, string format)
        {
            // In a real implementation, this would export data to the specified format
            // For now, return empty CSV
            byte[] fileContent = System.Text.Encoding.UTF8.GetBytes("id,name\n");
            string contentType = "text/csv";
            string fileName = $"{collectionName}_export.csv";

            return (fileContent, contentType, fileName);
        }
    }
}
