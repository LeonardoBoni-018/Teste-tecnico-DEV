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
public class ProdutosController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProdutosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var produtos = await _context.Produtos
            .OrderBy(p => p.Codigo)
            .Select(p => new ProdutoResponse
            {
                Id = p.Id,
                Codigo = p.Codigo,
                Descricao = p.Descricao,
                CodigoBarras = p.CodigoBarras,
                ValorVenda = p.ValorVenda,
                PesoBruto = p.PesoBruto,
                PesoLiquido = p.PesoLiquido,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            })
            .ToListAsync();

        return Ok(produtos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var produto = await _context.Produtos.FindAsync(id);
        if (produto == null)
            return NotFound(new { message = "Produto não encontrado" });

        return Ok(MapToResponse(produto));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProdutoRequest request)
    {
        if (await _context.Produtos.AnyAsync(p => p.Codigo == request.Codigo))
            return BadRequest(new { message = "Já existe um produto com este código" });

        var produto = new Produto
        {
            Codigo = request.Codigo,
            Descricao = request.Descricao,
            CodigoBarras = request.CodigoBarras,
            ValorVenda = request.ValorVenda,
            PesoBruto = request.PesoBruto,
            PesoLiquido = request.PesoLiquido
        };

        _context.Produtos.Add(produto);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = produto.Id }, MapToResponse(produto));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ProdutoRequest request)
    {
        var produto = await _context.Produtos.FindAsync(id);
        if (produto == null)
            return NotFound(new { message = "Produto não encontrado" });

        if (await _context.Produtos.AnyAsync(p => p.Codigo == request.Codigo && p.Id != id))
            return BadRequest(new { message = "Já existe outro produto com este código" });

        produto.Codigo = request.Codigo;
        produto.Descricao = request.Descricao;
        produto.CodigoBarras = request.CodigoBarras;
        produto.ValorVenda = request.ValorVenda;
        produto.PesoBruto = request.PesoBruto;
        produto.PesoLiquido = request.PesoLiquido;
        produto.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapToResponse(produto));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var produto = await _context.Produtos.FindAsync(id);
        if (produto == null)
            return NotFound(new { message = "Produto não encontrado" });

        _context.Produtos.Remove(produto);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static ProdutoResponse MapToResponse(Produto p) => new()
    {
        Id = p.Id,
        Codigo = p.Codigo,
        Descricao = p.Descricao,
        CodigoBarras = p.CodigoBarras,
        ValorVenda = p.ValorVenda,
        PesoBruto = p.PesoBruto,
        PesoLiquido = p.PesoLiquido,
        CreatedAt = p.CreatedAt,
        UpdatedAt = p.UpdatedAt
    };
}
