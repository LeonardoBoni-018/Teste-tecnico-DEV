using System.ComponentModel.DataAnnotations;

namespace SoftLineTeste.Api.DTOs;

public class LoginRequest
{
    [Required(ErrorMessage = "Usuário é obrigatório")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Senha é obrigatória")]
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}
