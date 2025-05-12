using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NocoStudio.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NocoStudio.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DataController : ControllerBase
    {
        private readonly IDataService _dataService;

        public DataController(IDataService dataService)
        {
            _dataService = dataService;
        }

        [HttpGet("{collectionName}")]
        public async Task<ActionResult<IEnumerable<dynamic>>> GetData(string collectionName, [FromQuery] Dictionary<string, string> queryParams)
        {
            try
            {
                var data = await _dataService.GetDataAsync(collectionName, queryParams);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{collectionName}/{id}")]
        public async Task<ActionResult<dynamic>> GetDataById(string collectionName, string id)
        {
            try
            {
                var item = await _dataService.GetDataByIdAsync(collectionName, id);

                if (item == null)
                {
                    return NotFound();
                }

                return Ok(item);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{collectionName}")]
        public async Task<ActionResult<dynamic>> CreateData(string collectionName, [FromBody] dynamic data)
        {
            try
            {
                var createdItem = await _dataService.CreateDataAsync(collectionName, data);
                return CreatedAtAction(nameof(GetDataById), new { collectionName, id = createdItem.id }, createdItem);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{collectionName}/{id}")]
        public async Task<IActionResult> UpdateData(string collectionName, string id, [FromBody] dynamic data)
        {
            try
            {
                var updatedItem = await _dataService.UpdateDataAsync(collectionName, id, data);
                return Ok(updatedItem);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{collectionName}/{id}")]
        public async Task<IActionResult> DeleteData(string collectionName, string id)
        {
            try
            {
                await _dataService.DeleteDataAsync(collectionName, id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{collectionName}/bulk")]
        public async Task<IActionResult> BulkCreateData(string collectionName, [FromBody] IEnumerable<dynamic> data)
        {
            try
            {
                var createdItems = await _dataService.BulkCreateDataAsync(collectionName, data);
                return Ok(createdItems);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{collectionName}/import")]
        public async Task<IActionResult> ImportData(string collectionName, IFormFile file)
        {
            try
            {
                var importResult = await _dataService.ImportDataAsync(collectionName, file);
                return Ok(importResult);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{collectionName}/export")]
        public async Task<IActionResult> ExportData(string collectionName, [FromQuery] string format = "csv")
        {
            try
            {
                var (fileContent, contentType, fileName) = await _dataService.ExportDataAsync(collectionName, format);
                return File(fileContent, contentType, fileName);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
