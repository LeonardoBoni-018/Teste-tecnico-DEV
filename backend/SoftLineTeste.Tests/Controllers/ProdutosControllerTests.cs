using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftLineTeste.Api.Controllers;
using SoftLineTeste.Api.Data;
using SoftLineTeste.Api.DTOs;
using SoftLineTeste.Api.Models;
using FluentAssertions;

namespace SoftLineTeste.Tests.Controllers;

public class ProdutosControllerTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly ProdutosController _controller;

    public ProdutosControllerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _controller = new ProdutosController(_context);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task GetAll_ReturnsEmptyList_WhenNoProducts()
    {
        var result = await _controller.GetAll();

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var produtos = okResult.Value.Should().BeAssignableTo<List<ProdutoResponse>>().Subject;
        produtos.Should().BeEmpty();
    }

    [Fact]
    public async Task Create_AddsProduct_AndReturnsCreated()
    {
        var request = new ProdutoRequest
        {
            Codigo = 1,
            Descricao = "Produto Teste",
            CodigoBarras = "7891234567890",
            ValorVenda = 29.99m,
            PesoBruto = 1.500m,
            PesoLiquido = 1.200m
        };

        var result = await _controller.Create(request);

        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var produto = createdResult.Value.Should().BeOfType<ProdutoResponse>().Subject;
        produto.Codigo.Should().Be(1);
        produto.Descricao.Should().Be("Produto Teste");
        produto.CodigoBarras.Should().Be("7891234567890");
        produto.ValorVenda.Should().Be(29.99m);
        produto.PesoBruto.Should().Be(1.500m);
        produto.PesoLiquido.Should().Be(1.200m);

        _context.Produtos.Count().Should().Be(1);
    }

    [Fact]
    public async Task Create_ReturnsBadRequest_WhenCodigoDuplicated()
    {
        _context.Produtos.Add(new Produto
        {
            Codigo = 1,
            Descricao = "Existing",
            CodigoBarras = "00000000000000",
            ValorVenda = 10m,
            PesoBruto = 1m,
            PesoLiquido = 0.5m
        });
        await _context.SaveChangesAsync();

        var request = new ProdutoRequest
        {
            Codigo = 1,
            Descricao = "Duplicate",
            CodigoBarras = "11111111111111",
            ValorVenda = 20m,
            PesoBruto = 2m,
            PesoLiquido = 1m
        };

        var result = await _controller.Create(request);
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task GetById_ReturnsProduct_WhenExists()
    {
        var produto = new Produto
        {
            Codigo = 10,
            Descricao = "Produto Busca",
            CodigoBarras = "99999999999999",
            ValorVenda = 5.50m,
            PesoBruto = 0.800m,
            PesoLiquido = 0.600m
        };
        _context.Produtos.Add(produto);
        await _context.SaveChangesAsync();

        var result = await _controller.GetById(produto.Id);

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<ProdutoResponse>().Subject;
        response.Codigo.Should().Be(10);
        response.Descricao.Should().Be("Produto Busca");
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenNotExists()
    {
        var result = await _controller.GetById(999);
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task Update_ModifiesProduct_AndReturnsOk()
    {
        var produto = new Produto
        {
            Codigo = 5,
            Descricao = "Original",
            CodigoBarras = "00000000000000",
            ValorVenda = 10m,
            PesoBruto = 1m,
            PesoLiquido = 0.5m
        };
        _context.Produtos.Add(produto);
        await _context.SaveChangesAsync();

        var request = new ProdutoRequest
        {
            Codigo = 5,
            Descricao = "Updated",
            CodigoBarras = "11111111111111",
            ValorVenda = 99.99m,
            PesoBruto = 5.000m,
            PesoLiquido = 4.000m
        };

        var result = await _controller.Update(produto.Id, request);

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<ProdutoResponse>().Subject;
        response.Descricao.Should().Be("Updated");
        response.ValorVenda.Should().Be(99.99m);
    }

    [Fact]
    public async Task Update_ReturnsNotFound_WhenNotExists()
    {
        var request = new ProdutoRequest
        {
            Codigo = 99,
            Descricao = "NotFound",
            CodigoBarras = "00000000000000",
            ValorVenda = 10m,
            PesoBruto = 1m,
            PesoLiquido = 0.5m
        };

        var result = await _controller.Update(999, request);
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task Delete_RemovesProduct_AndReturnsNoContent()
    {
        var produto = new Produto
        {
            Codigo = 7,
            Descricao = "ToDelete",
            CodigoBarras = "00000000000000",
            ValorVenda = 10m,
            PesoBruto = 1m,
            PesoLiquido = 0.5m
        };
        _context.Produtos.Add(produto);
        await _context.SaveChangesAsync();

        var result = await _controller.Delete(produto.Id);

        result.Should().BeOfType<NoContentResult>();
        _context.Produtos.Count().Should().Be(0);
    }

    [Fact]
    public async Task Delete_ReturnsNotFound_WhenNotExists()
    {
        var result = await _controller.Delete(999);
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task CreateProduct_ThenGetAll_ReturnsListWithOneItem()
    {
        var request = new ProdutoRequest
        {
            Codigo = 100,
            Descricao = "E2E Test",
            CodigoBarras = "12345678901234",
            ValorVenda = 15.00m,
            PesoBruto = 2.000m,
            PesoLiquido = 1.500m
        };

        await _controller.Create(request);

        var result = await _controller.GetAll();
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var produtos = okResult.Value.Should().BeAssignableTo<List<ProdutoResponse>>().Subject;
        produtos.Should().HaveCount(1);
        produtos[0].Descricao.Should().Be("E2E Test");
    }
}
