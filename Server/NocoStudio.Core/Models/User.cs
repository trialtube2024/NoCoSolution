using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace NocoStudio.Core.Models
{
    public class User
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        
        [JsonIgnore]
        public string? PasswordHash { get; set; }
        
        public List<string> Roles { get; set; } = new List<string>();
        public bool Active { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class ApiToken
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = null!;
        public string Token { get; set; } = null!;
        public List<string> Scopes { get; set; } = new List<string>();
        public DateTime? ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string UserId { get; set; } = null!;
    }

    public class SystemSettings
    {
        public string Id { get; set; } = "settings";
        public string AppName { get; set; } = "NocoStudio";
        public string? Logo { get; set; }
        public string? Theme { get; set; }
        public string? Locale { get; set; }
        public string? DateFormat { get; set; }
        public string? TimeFormat { get; set; }
        public string? DefaultRole { get; set; }
        public List<string>? Plugins { get; set; }
    }

    public class Plugin
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Version { get; set; } = null!;
        public string? Description { get; set; }
        public bool Enabled { get; set; }
        public Dictionary<string, object>? Settings { get; set; }
    }
}
