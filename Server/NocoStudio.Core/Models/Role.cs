using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace NocoStudio.Core.Models
{
    public class Role
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = null!;
        public string DisplayName { get; set; } = null!;
        public string? Description { get; set; }
        public List<Permission> Permissions { get; set; } = new List<Permission>();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Permission
    {
        public PermissionAction Action { get; set; }
        public string Subject { get; set; } = null!;
        public Dictionary<string, object>? Conditions { get; set; }
        public List<string>? Fields { get; set; }
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum PermissionAction
    {
        Create,
        Read,
        Update,
        Delete,
        All
    }
}
