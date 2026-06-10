using System.ComponentModel.DataAnnotations;

namespace SoftLineTeste.Api.DTOs;

public class LoginRequest
{
    [Required(ErrorMessage = "Usuário é obrigatório")]
    [MinLength(3, ErrorMessage = "Usuário deve ter no mínimo 3 caracteres")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Senha é obrigatória")]
    [MinLength(6, ErrorMessage = "Senha deve ter no mínimo 6 caracteres")]
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}
