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
    public class FormsController : ControllerBase
    {
        private readonly IFormService _formService;

        public FormsController(IFormService formService)
        {
            _formService = formService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FormConfig>>> GetForms()
        {
            var forms = await _formService.GetFormsAsync();
            return Ok(forms);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FormConfig>> GetForm(string id)
        {
            var form = await _formService.GetFormByIdAsync(id);

            if (form == null)
            {
                return NotFound();
            }

            return Ok(form);
        }

        [HttpPost]
        public async Task<ActionResult<FormConfig>> CreateForm(FormConfig form)
        {
            try
            {
                var createdForm = await _formService.CreateFormAsync(form);
                return CreatedAtAction(nameof(GetForm), new { id = createdForm.Id }, createdForm);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateForm(string id, FormConfig form)
        {
            if (id != form.Id)
            {
                return BadRequest();
            }

            try
            {
                var updatedForm = await _formService.UpdateFormAsync(form);
                return Ok(updatedForm);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteForm(string id)
        {
            try
            {
                await _formService.DeleteFormAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/submit")]
        public async Task<IActionResult> SubmitForm(string id, [FromBody] Dictionary<string, object> formData)
        {
            try
            {
                var result = await _formService.SubmitFormAsync(id, formData);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/render")]
        public async Task<IActionResult> RenderForm(string id)
        {
            try
            {
                var formRender = await _formService.RenderFormAsync(id);
                return Ok(formRender);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
