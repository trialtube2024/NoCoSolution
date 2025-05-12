using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace NocoStudio.Core.Models
{
    public class Schema
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = null!;
        public string DisplayName { get; set; } = null!;
        public string? Description { get; set; }
        public List<Collection> Collections { get; set; } = new List<Collection>();
        public string Version { get; set; } = "1.0";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Collection
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = null!;
        public string DisplayName { get; set; } = null!;
        public string? Description { get; set; }
        public List<Field> Fields { get; set; } = new List<Field>();
        public List<Index>? Indexes { get; set; }
        public bool IsSystem { get; set; }
        public bool Timestamps { get; set; } = true;
    }

    public class Field
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = null!;
        public string DisplayName { get; set; } = null!;
        public string? Description { get; set; }
        public FieldType Type { get; set; }
        public bool Required { get; set; }
        public bool Unique { get; set; }
        public object? DefaultValue { get; set; }
        public List<FieldOption>? Options { get; set; }
        public List<Validation>? Validations { get; set; }
        public Dictionary<string, object>? Settings { get; set; }
    }

    public class RelationField : Field
    {
        public RelationType RelationType { get; set; }
        public string TargetCollection { get; set; } = null!;
        public string? ForeignKey { get; set; }
        public string? Through { get; set; }
        public string? TargetField { get; set; }
    }

    public class FieldOption
    {
        public string Label { get; set; } = null!;
        public object Value { get; set; } = null!;
    }

    public class Validation
    {
        public string Type { get; set; } = null!;
        public object? Params { get; set; }
        public string Message { get; set; } = null!;
    }

    public class Index
    {
        public string Name { get; set; } = null!;
        public List<string> Fields { get; set; } = new List<string>();
        public bool Unique { get; set; }
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum FieldType
    {
        String,
        Text,
        Number,
        Integer,
        Decimal,
        Boolean,
        Date,
        DateTime,
        Email,
        Password,
        Enum,
        Json,
        Uuid,
        Relation,
        File,
        Image
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum RelationType
    {
        OneToOne,
        OneToMany,
        ManyToOne,
        ManyToMany
    }
}
