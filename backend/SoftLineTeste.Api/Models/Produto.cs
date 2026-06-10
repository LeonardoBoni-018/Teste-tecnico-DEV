using System.ComponentModel.DataAnnotations;

namespace SoftLineTeste.Api.Models;

public class Produto
{
    public int Id { get; set; }

    public int Codigo { get; set; }

    [Required, MaxLength(60)]
    public string Descricao { get; set; } = string.Empty;

    [Required, MaxLength(14)]
    public string CodigoBarras { get; set; } = string.Empty;

    [Required]
    public decimal ValorVenda { get; set; }

    [Required]
    public decimal PesoBruto { get; set; }

    [Required]
    public decimal PesoLiquido { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
