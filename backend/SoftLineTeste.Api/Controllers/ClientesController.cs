using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftLineTeste.Api.Data;
using SoftLineTeste.Api.DTOs;
using SoftLineTeste.Api.Models;

namespace SoftLineTeste.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ClientesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var clientes = await _context.Clientes
            .OrderBy(c => c.Codigo)
            .Select(c => new ClienteResponse
            {
                Id = c.Id,
                Codigo = c.Codigo,
                Nome = c.Nome,
                Fantasia = c.Fantasia,
                Documento = c.Documento,
                Endereco = c.Endereco,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToListAsync();

        return Ok(clientes);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var cliente = await _context.Clientes.FindAsync(id);
        if (cliente == null)
            return NotFound(new { message = "Cliente não encontrado" });

        return Ok(MapToResponse(cliente));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ClienteRequest request)
    {
        if (await _context.Clientes.AnyAsync(c => c.Codigo == request.Codigo))
            return BadRequest(new { message = "Já existe um cliente com este código" });

        var cliente = new Cliente
        {
            Codigo = request.Codigo,
            Nome = request.Nome,
            Fantasia = request.Fantasia,
            Documento = request.Documento,
            Endereco = request.Endereco
        };

        _context.Clientes.Add(cliente);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = cliente.Id }, MapToResponse(cliente));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ClienteRequest request)
    {
        var cliente = await _context.Clientes.FindAsync(id);
        if (cliente == null)
            return NotFound(new { message = "Cliente não encontrado" });

        if (await _context.Clientes.AnyAsync(c => c.Codigo == request.Codigo && c.Id != id))
            return BadRequest(new { message = "Já existe outro cliente com este código" });

        cliente.Codigo = request.Codigo;
        cliente.Nome = request.Nome;
        cliente.Fantasia = request.Fantasia;
        cliente.Documento = request.Documento;
        cliente.Endereco = request.Endereco;
        cliente.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapToResponse(cliente));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var cliente = await _context.Clientes.FindAsync(id);
        if (cliente == null)
            return NotFound(new { message = "Cliente não encontrado" });

        _context.Clientes.Remove(cliente);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static ClienteResponse MapToResponse(Cliente c) => new()
    {
        Id = c.Id,
        Codigo = c.Codigo,
        Nome = c.Nome,
        Fantasia = c.Fantasia,
        Documento = c.Documento,
        Endereco = c.Endereco,
        CreatedAt = c.CreatedAt,
        UpdatedAt = c.UpdatedAt
    };
}
