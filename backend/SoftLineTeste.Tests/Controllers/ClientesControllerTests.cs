using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftLineTeste.Api.Controllers;
using SoftLineTeste.Api.Data;
using SoftLineTeste.Api.DTOs;
using SoftLineTeste.Api.Models;
using FluentAssertions;

namespace SoftLineTeste.Tests.Controllers;

public class ClientesControllerTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly ClientesController _controller;

    public ClientesControllerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _controller = new ClientesController(_context);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task GetAll_ReturnsEmptyList_WhenNoClientes()
    {
        var result = await _controller.GetAll();

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var clientes = okResult.Value.Should().BeAssignableTo<List<ClienteResponse>>().Subject;
        clientes.Should().BeEmpty();
    }

    [Fact]
    public async Task Create_AddsCliente_AndReturnsCreated()
    {
        var request = new ClienteRequest
        {
            Codigo = 1,
            Nome = "Empresa XPTO Ltda",
            Fantasia = "XPTO",
            Documento = "52998224725",
            Endereco = "Rua Principal, 100"
        };

        var result = await _controller.Create(request);

        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var cliente = createdResult.Value.Should().BeOfType<ClienteResponse>().Subject;
        cliente.Codigo.Should().Be(1);
        cliente.Nome.Should().Be("Empresa XPTO Ltda");
        cliente.Fantasia.Should().Be("XPTO");
        cliente.Documento.Should().Be("52998224725");
        cliente.Endereco.Should().Be("Rua Principal, 100");

        _context.Clientes.Count().Should().Be(1);
    }

    [Fact]
    public async Task Create_ReturnsBadRequest_WhenCodigoDuplicated()
    {
        _context.Clientes.Add(new Cliente
        {
            Codigo = 1,
            Nome = "Existing",
            Fantasia = "Existing",
            Documento = "11222333000181",
            Endereco = "Address 1"
        });
        await _context.SaveChangesAsync();

        var request = new ClienteRequest
        {
            Codigo = 1,
            Nome = "Duplicate",
            Fantasia = "Duplicate",
            Documento = "52998224725",
            Endereco = "Address 2"
        };

        var result = await _controller.Create(request);
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task GetById_ReturnsCliente_WhenExists()
    {
        var cliente = new Cliente
        {
            Codigo = 10,
            Nome = "Cliente Busca",
            Fantasia = "Busca",
            Documento = "52998224725",
            Endereco = "Rua Teste, 200"
        };
        _context.Clientes.Add(cliente);
        await _context.SaveChangesAsync();

        var result = await _controller.GetById(cliente.Id);

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<ClienteResponse>().Subject;
        response.Codigo.Should().Be(10);
        response.Nome.Should().Be("Cliente Busca");
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenNotExists()
    {
        var result = await _controller.GetById(999);
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task Update_ModifiesCliente_AndReturnsOk()
    {
        var cliente = new Cliente
        {
            Codigo = 5,
            Nome = "Original",
            Fantasia = "Original",
            Documento = "11222333000181",
            Endereco = "Original Address"
        };
        _context.Clientes.Add(cliente);
        await _context.SaveChangesAsync();

        var request = new ClienteRequest
        {
            Codigo = 5,
            Nome = "Updated",
            Fantasia = "Updated",
            Documento = "52998224725",
            Endereco = "Updated Address"
        };

        var result = await _controller.Update(cliente.Id, request);

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<ClienteResponse>().Subject;
        response.Nome.Should().Be("Updated");
        response.Fantasia.Should().Be("Updated");
    }

    [Fact]
    public async Task Update_ReturnsNotFound_WhenNotExists()
    {
        var request = new ClienteRequest
        {
            Codigo = 99,
            Nome = "NotFound",
            Fantasia = "NotFound",
            Documento = "52998224725",
            Endereco = "Nowhere"
        };

        var result = await _controller.Update(999, request);
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task Delete_RemovesCliente_AndReturnsNoContent()
    {
        var cliente = new Cliente
        {
            Codigo = 7,
            Nome = "ToDelete",
            Fantasia = "ToDelete",
            Documento = "11222333000181",
            Endereco = "Delete Address"
        };
        _context.Clientes.Add(cliente);
        await _context.SaveChangesAsync();

        var result = await _controller.Delete(cliente.Id);

        result.Should().BeOfType<NoContentResult>();
        _context.Clientes.Count().Should().Be(0);
    }

    [Fact]
    public async Task Delete_ReturnsNotFound_WhenNotExists()
    {
        var result = await _controller.Delete(999);
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task CreateCliente_ThenGetAll_ReturnsListWithOneItem()
    {
        var request = new ClienteRequest
        {
            Codigo = 100,
            Nome = "E2E Cliente",
            Fantasia = "E2E",
            Documento = "52998224725",
            Endereco = "E2E Address"
        };

        await _controller.Create(request);

        var result = await _controller.GetAll();
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var clientes = okResult.Value.Should().BeAssignableTo<List<ClienteResponse>>().Subject;
        clientes.Should().HaveCount(1);
        clientes[0].Nome.Should().Be("E2E Cliente");
    }
}
