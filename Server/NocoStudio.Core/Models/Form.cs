using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace NocoStudio.Core.Models
{
    public class FormConfig
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = null!;
        public string DisplayName { get; set; } = null!;
        public string? Description { get; set; }
        public string Collection { get; set; } = null!;
        public List<FormLayout> Layouts { get; set; } = new List<FormLayout>();
        public List<FormField> Fields { get; set; } = new List<FormField>();
        public List<FormAction> Actions { get; set; } = new List<FormAction>();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class FormLayout
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public FormLayoutType Type { get; set; }
        public Dictionary<string, object> Config { get; set; } = new Dictionary<string, object>();
    }

    public class FormField
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string FieldId { get; set; } = null!;
        public FormFieldLayout Layout { get; set; } = new FormFieldLayout();
        public FormFieldSettings Settings { get; set; } = new FormFieldSettings();
    }

    public class FormFieldLayout
    {
        public int X { get; set; }
        public int Y { get; set; }
        public int W { get; set; }
        public int H { get; set; }
    }

    public class FormFieldSettings
    {
        public string? Label { get; set; }
        public string? Description { get; set; }
        public string? Placeholder { get; set; }
        public bool Disabled { get; set; }
        public bool Hidden { get; set; }
        public object? DefaultValue { get; set; }
        public string? Component { get; set; }
    }

    public class FormAction
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public FormActionType Type { get; set; }
        public string Label { get; set; } = null!;
        public FormActionPosition Position { get; set; }
        public string? Handler { get; set; }
        public FormActionStyle Style { get; set; }
    }

    public class FormSubmission
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string FormId { get; set; } = null!;
        public string? RecordId { get; set; }
        public Dictionary<string, object> Data { get; set; } = new Dictionary<string, object>();
        public string Status { get; set; } = "completed";
        public string? UserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum FormLayoutType
    {
        Grid,
        Tabs,
        Steps,
        Sections
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum FormActionType
    {
        Submit,
        Cancel,
        Custom
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum FormActionPosition
    {
        Start,
        End
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum FormActionStyle
    {
        Primary,
        Secondary,
        Accent,
        Warn
    }
}
