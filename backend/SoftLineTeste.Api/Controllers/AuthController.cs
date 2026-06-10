using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftLineTeste.Api.Data;
using SoftLineTeste.Api.DTOs;
using SoftLineTeste.Api.Models;
using SoftLineTeste.Api.Services;

namespace SoftLineTeste.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AppDbContext context, TokenService tokenService, ILogger<AuthController> logger)
    {
        _context = context;
        _tokenService = tokenService;
        _logger = logger;
    }

    [HttpGet("can-register")]
    public async Task<IActionResult> CanRegister()
    {
        var hasUsers = await _context.Usuarios.AnyAsync();
        return Ok(new { canRegister = !hasUsers });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (await _context.Usuarios.AnyAsync(u => u.Username == request.Username))
            return BadRequest(new { message = "Este nome de usuário já está em uso" });

        var usuario = new Usuario
        {
            Username = request.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Nome = request.Nome
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        var (token, expiresAt) = _tokenService.GenerateToken(usuario);
        _logger.LogInformation("First user {Username} registered successfully", request.Username);

        return Ok(new LoginResponse
        {
            Token = token,
            Nome = usuario.Nome,
            ExpiresAt = expiresAt
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        if (usuario == null || !BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash))
        {
            _logger.LogWarning("Failed login attempt for user: {Username}", request.Username);
            return Unauthorized(new { message = "Usuário ou senha inválidos" });
        }

        var (token, expiresAt) = _tokenService.GenerateToken(usuario);
        _logger.LogInformation("User {Username} logged in successfully", request.Username);

        return Ok(new LoginResponse
        {
            Token = token,
            Nome = usuario.Nome,
            ExpiresAt = expiresAt
        });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult GetCurrentUser()
    {
        var nome = User.FindFirst("nome")?.Value;
        var username = User.Identity?.Name;
        return Ok(new { nome, username });
    }
}
