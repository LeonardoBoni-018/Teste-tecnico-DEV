using System.ComponentModel.DataAnnotations;

namespace SoftLineTeste.Api.DTOs;

public class ProdutoRequest
{
    [Required(ErrorMessage = "Código é obrigatório")]
    [Range(1, int.MaxValue, ErrorMessage = "Código deve ser um número positivo")]
    public int Codigo { get; set; }

    [Required(ErrorMessage = "Descrição é obrigatória")]
    [MaxLength(60, ErrorMessage = "Descrição deve ter no máximo 60 caracteres")]
    public string Descricao { get; set; } = string.Empty;

    [Required(ErrorMessage = "Código de Barras é obrigatório")]
    [MaxLength(14, ErrorMessage = "Código de Barras deve ter no máximo 14 caracteres")]
    public string CodigoBarras { get; set; } = string.Empty;

    [Required(ErrorMessage = "Valor de Venda é obrigatório")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Valor de Venda deve ser maior que zero")]
    public decimal ValorVenda { get; set; }

    [Required(ErrorMessage = "Peso Bruto é obrigatório")]
    [Range(0.001, double.MaxValue, ErrorMessage = "Peso Bruto deve ser maior que zero")]
    public decimal PesoBruto { get; set; }

    [Required(ErrorMessage = "Peso Líquido é obrigatório")]
    [Range(0.001, double.MaxValue, ErrorMessage = "Peso Líquido deve ser maior que zero")]
    public decimal PesoLiquido { get; set; }
}

public class ProdutoResponse
{
    public int Id { get; set; }
    public int Codigo { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public string CodigoBarras { get; set; } = string.Empty;
    public decimal ValorVenda { get; set; }
    public decimal PesoBruto { get; set; }
    public decimal PesoLiquido { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
