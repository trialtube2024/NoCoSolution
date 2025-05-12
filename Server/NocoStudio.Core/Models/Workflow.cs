using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace NocoStudio.Core.Models
{
    public class Workflow
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = null!;
        public string DisplayName { get; set; } = null!;
        public string? Description { get; set; }
        public WorkflowTrigger Trigger { get; set; } = new WorkflowTrigger();
        public List<WorkflowNode> Nodes { get; set; } = new List<WorkflowNode>();
        public List<WorkflowEdge> Edges { get; set; } = new List<WorkflowEdge>();
        public bool Active { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class WorkflowTrigger
    {
        public WorkflowTriggerType Type { get; set; }
        public Dictionary<string, object> Config { get; set; } = new Dictionary<string, object>();
    }

    public class WorkflowNode
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Type { get; set; } = null!;
        public WorkflowNodePosition Position { get; set; } = new WorkflowNodePosition();
        public WorkflowNodeData Data { get; set; } = new WorkflowNodeData();
    }

    public class WorkflowNodePosition
    {
        public int X { get; set; }
        public int Y { get; set; }
    }

    public class WorkflowNodeData
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? TriggerType { get; set; }
        public Dictionary<string, object> Config { get; set; } = new Dictionary<string, object>();
    }

    public class WorkflowEdge
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Source { get; set; } = null!;
        public string Target { get; set; } = null!;
        public string? Label { get; set; }
        public string? Condition { get; set; }
    }

    public class WorkflowExecution
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string WorkflowId { get; set; } = null!;
        public string Status { get; set; } = "running";
        public Dictionary<string, object> Input { get; set; } = new Dictionary<string, object>();
        public Dictionary<string, object> Output { get; set; } = new Dictionary<string, object>();
        public List<WorkflowExecutionLog> Logs { get; set; } = new List<WorkflowExecutionLog>();
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
        public string? Error { get; set; }
    }

    public class WorkflowExecutionLog
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string NodeId { get; set; } = null!;
        public string Status { get; set; } = null!;
        public Dictionary<string, object>? InputData { get; set; }
        public Dictionary<string, object>? OutputData { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? Error { get; set; }
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum WorkflowTriggerType
    {
        Event,
        Schedule,
        Webhook,
        Manual
    }
}
