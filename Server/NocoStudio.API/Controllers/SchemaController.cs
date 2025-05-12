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
    public class SchemasController : ControllerBase
    {
        private readonly ISchemaService _schemaService;

        public SchemasController(ISchemaService schemaService)
        {
            _schemaService = schemaService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Schema>>> GetSchemas()
        {
            var schemas = await _schemaService.GetSchemasAsync();
            return Ok(schemas);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Schema>> GetSchema(string id)
        {
            var schema = await _schemaService.GetSchemaByIdAsync(id);

            if (schema == null)
            {
                return NotFound();
            }

            return Ok(schema);
        }

        [HttpPost]
        public async Task<ActionResult<Schema>> CreateSchema(Schema schema)
        {
            try
            {
                var createdSchema = await _schemaService.CreateSchemaAsync(schema);
                return CreatedAtAction(nameof(GetSchema), new { id = createdSchema.Id }, createdSchema);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSchema(string id, Schema schema)
        {
            if (id != schema.Id)
            {
                return BadRequest();
            }

            try
            {
                var updatedSchema = await _schemaService.UpdateSchemaAsync(schema);
                return Ok(updatedSchema);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchema(string id)
        {
            try
            {
                await _schemaService.DeleteSchemaAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{schemaId}/collections")]
        public async Task<ActionResult<IEnumerable<Collection>>> GetCollections(string schemaId)
        {
            var schema = await _schemaService.GetSchemaByIdAsync(schemaId);

            if (schema == null)
            {
                return NotFound();
            }

            return Ok(schema.Collections);
        }

        [HttpGet("{schemaId}/collections/{id}")]
        public async Task<ActionResult<Collection>> GetCollection(string schemaId, string id)
        {
            var schema = await _schemaService.GetSchemaByIdAsync(schemaId);

            if (schema == null)
            {
                return NotFound();
            }

            var collection = schema.Collections.FirstOrDefault(c => c.Id == id);

            if (collection == null)
            {
                return NotFound();
            }

            return Ok(collection);
        }

        [HttpPost("{schemaId}/collections")]
        public async Task<ActionResult<Collection>> CreateCollection(string schemaId, Collection collection)
        {
            try
            {
                var createdCollection = await _schemaService.AddCollectionAsync(schemaId, collection);
                return CreatedAtAction(nameof(GetCollection), new { schemaId, id = createdCollection.Id }, createdCollection);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{schemaId}/collections/{id}")]
        public async Task<IActionResult> UpdateCollection(string schemaId, string id, Collection collection)
        {
            if (id != collection.Id)
            {
                return BadRequest();
            }

            try
            {
                var updatedCollection = await _schemaService.UpdateCollectionAsync(schemaId, collection);
                return Ok(updatedCollection);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{schemaId}/collections/{id}")]
        public async Task<IActionResult> DeleteCollection(string schemaId, string id)
        {
            try
            {
                await _schemaService.DeleteCollectionAsync(schemaId, id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
