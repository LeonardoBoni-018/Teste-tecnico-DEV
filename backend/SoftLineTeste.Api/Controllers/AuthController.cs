using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftLineTeste.Api.Data;
using SoftLineTeste.Api.DTOs;
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
