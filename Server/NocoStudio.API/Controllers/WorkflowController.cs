using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NocoStudio.Core.Interfaces;
using NocoStudio.Core.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NocoStudio.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WorkflowsController : ControllerBase
    {
        private readonly IWorkflowService _workflowService;

        public WorkflowsController(IWorkflowService workflowService)
        {
            _workflowService = workflowService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Workflow>>> GetWorkflows()
        {
            var workflows = await _workflowService.GetWorkflowsAsync();
            return Ok(workflows);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Workflow>> GetWorkflow(string id)
        {
            var workflow = await _workflowService.GetWorkflowByIdAsync(id);

            if (workflow == null)
            {
                return NotFound();
            }

            return Ok(workflow);
        }

        [HttpPost]
        public async Task<ActionResult<Workflow>> CreateWorkflow(Workflow workflow)
        {
            try
            {
                var createdWorkflow = await _workflowService.CreateWorkflowAsync(workflow);
                return CreatedAtAction(nameof(GetWorkflow), new { id = createdWorkflow.Id }, createdWorkflow);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWorkflow(string id, Workflow workflow)
        {
            if (id != workflow.Id)
            {
                return BadRequest();
            }

            try
            {
                var updatedWorkflow = await _workflowService.UpdateWorkflowAsync(workflow);
                return Ok(updatedWorkflow);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkflow(string id)
        {
            try
            {
                await _workflowService.DeleteWorkflowAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/execute")]
        public async Task<IActionResult> ExecuteWorkflow(string id, [FromBody] Dictionary<string, object> data)
        {
            try
            {
                var result = await _workflowService.ExecuteWorkflowAsync(id, data);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/history")]
        public async Task<IActionResult> GetWorkflowHistory(string id)
        {
            try
            {
                var history = await _workflowService.GetWorkflowHistoryAsync(id);
                return Ok(history);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/toggle")]
        public async Task<IActionResult> ToggleWorkflowState(string id)
        {
            try
            {
                var workflow = await _workflowService.ToggleWorkflowStateAsync(id);
                return Ok(workflow);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
