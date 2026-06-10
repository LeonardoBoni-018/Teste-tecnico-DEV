using System.ComponentModel.DataAnnotations;

namespace SoftLineTeste.Api.Models;

public class Cliente
{
    public int Id { get; set; }

    public int Codigo { get; set; }

    [Required, MaxLength(60)]
    public string Nome { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Fantasia { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Documento { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string Endereco { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
