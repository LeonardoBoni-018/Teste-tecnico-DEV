using System.ComponentModel.DataAnnotations;

namespace SoftLineTeste.Api.DTOs;

public class ClienteRequest
{
    [Required(ErrorMessage = "Código é obrigatório")]
    [Range(1, int.MaxValue, ErrorMessage = "Código deve ser um número positivo")]
    public int Codigo { get; set; }

    [Required(ErrorMessage = "Nome é obrigatório")]
    [MaxLength(60, ErrorMessage = "Nome deve ter no máximo 60 caracteres")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "Fantasia é obrigatório")]
    [MaxLength(100, ErrorMessage = "Fantasia deve ter no máximo 100 caracteres")]
    public string Fantasia { get; set; } = string.Empty;

    [Required(ErrorMessage = "Documento é obrigatório")]
    [MaxLength(20, ErrorMessage = "Documento inválido")]
    public string Documento { get; set; } = string.Empty;

    [Required(ErrorMessage = "Endereço é obrigatório")]
    public string Endereco { get; set; } = string.Empty;
}

public class ClienteResponse
{
    public int Id { get; set; }
    public int Codigo { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Fantasia { get; set; } = string.Empty;
    public string Documento { get; set; } = string.Empty;
    public string Endereco { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
