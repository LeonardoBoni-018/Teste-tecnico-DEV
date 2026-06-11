using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using SoftLineTeste.Api.Controllers;
using SoftLineTeste.Api.Data;
using SoftLineTeste.Api.DTOs;
using SoftLineTeste.Api.Models;
using SoftLineTeste.Api.Services;
using FluentAssertions;

namespace SoftLineTeste.Tests.Controllers;

public class AuthControllerTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly AuthController _controller;
    private readonly TokenService _tokenService;

    public AuthControllerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);

        var configMock = new Mock<Microsoft.Extensions.Configuration.IConfiguration>();
        configMock.Setup(c => c["Jwt:Key"]).Returns("super-secret-key-for-testing-purposes-only!");
        configMock.Setup(c => c["Jwt:ExpireMinutes"]).Returns("60");
        configMock.Setup(c => c["Jwt:Issuer"]).Returns("Test");
        configMock.Setup(c => c["Jwt:Audience"]).Returns("Test");

        _tokenService = new TokenService(configMock.Object);
        var logger = new Mock<ILogger<AuthController>>().Object;

        _controller = new AuthController(_context, _tokenService, logger);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    // ========== CanRegister ==========

    [Fact]
    public async Task CanRegister_ReturnsTrue_WhenNoUsers()
    {
        var result = await _controller.CanRegister();

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeAssignableTo<object>().Subject;
        var canRegister = value.GetType().GetProperty("canRegister")?.GetValue(value);
        canRegister.Should().Be(true);
    }

    [Fact]
    public async Task CanRegister_ReturnsFalse_WhenUsersExist()
    {
        _context.Usuarios.Add(new Usuario
        {
            Username = "existing",
            PasswordHash = "hash",
            Nome = "Existing"
        });
        await _context.SaveChangesAsync();

        var result = await _controller.CanRegister();

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeAssignableTo<object>().Subject;
        var canRegister = value.GetType().GetProperty("canRegister")?.GetValue(value);
        canRegister.Should().Be(false);
    }

    // ========== Register ==========

    [Fact]
    public async Task Register_CreatesUser_AndReturnsToken()
    {
        var request = new RegisterRequest
        {
            Username = "newuser",
            Password = "123456",
            Nome = "New User"
        };

        var result = await _controller.Register(request);

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<LoginResponse>().Subject;
        response.Token.Should().NotBeNullOrEmpty();
        response.Nome.Should().Be("New User");

        _context.Usuarios.Count().Should().Be(1);
        var user = await _context.Usuarios.FirstAsync();
        user.Username.Should().Be("newuser");
    }

    [Fact]
    public async Task Register_ReturnsBadRequest_WhenUsernameExists()
    {
        _context.Usuarios.Add(new Usuario
        {
            Username = "existing",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
            Nome = "Existing"
        });
        await _context.SaveChangesAsync();

        var request = new RegisterRequest
        {
            Username = "existing",
            Password = "123456",
            Nome = "Duplicate"
        };

        var result = await _controller.Register(request);
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    // ========== Login ==========

    private async Task SeedUser()
    {
        _context.Usuarios.Add(new Usuario
        {
            Username = "testuser",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
            Nome = "Test User"
        });
        await _context.SaveChangesAsync();
    }

    [Fact]
    public async Task Login_ReturnsToken_WhenCredentialsValid()
    {
        await SeedUser();

        var request = new LoginRequest
        {
            Username = "testuser",
            Password = "123456"
        };

        var result = await _controller.Login(request);

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<LoginResponse>().Subject;
        response.Token.Should().NotBeNullOrEmpty();
        response.Nome.Should().Be("Test User");
    }

    [Fact]
    public async Task Login_ReturnsUnauthorized_WhenUsernameNotFound()
    {
        var request = new LoginRequest
        {
            Username = "nonexistent",
            Password = "123456"
        };

        var result = await _controller.Login(request);
        result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    [Fact]
    public async Task Login_ReturnsUnauthorized_WhenPasswordWrong()
    {
        await SeedUser();

        var request = new LoginRequest
        {
            Username = "testuser",
            Password = "wrongpassword"
        };

        var result = await _controller.Login(request);
        result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    // ========== Me ==========

    [Fact]
    public void GetCurrentUser_ReturnsUserInfo_WhenAuthenticated()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, "loggeduser"),
            new Claim("nome", "Logged User")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        var httpContext = new DefaultHttpContext { User = principal };
        _controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

        var result = _controller.GetCurrentUser();

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeAssignableTo<object>().Subject;
        var nome = value.GetType().GetProperty("nome")?.GetValue(value)?.ToString();
        var username = value.GetType().GetProperty("username")?.GetValue(value)?.ToString();
        nome.Should().Be("Logged User");
        username.Should().Be("loggeduser");
    }
}
