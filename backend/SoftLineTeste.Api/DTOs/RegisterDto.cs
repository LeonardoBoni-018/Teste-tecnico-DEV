using System.ComponentModel.DataAnnotations;

namespace SoftLineTeste.Api.DTOs;

public class RegisterRequest
{
    [Required(ErrorMessage = "Usuário é obrigatório")]
    [MinLength(3, ErrorMessage = "Usuário deve ter no mínimo 3 caracteres")]
    [MaxLength(50, ErrorMessage = "Usuário deve ter no máximo 50 caracteres")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Senha é obrigatória")]
    [MinLength(6, ErrorMessage = "Senha deve ter no mínimo 6 caracteres")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Nome é obrigatório")]
    [MaxLength(100, ErrorMessage = "Nome deve ter no máximo 100 caracteres")]
    public string Nome { get; set; } = string.Empty;
}
