using System.ComponentModel.DataAnnotations;
using SoftLineTeste.Api.DTOs;
using FluentAssertions;

namespace SoftLineTeste.Tests.DTOs;

public class ProdutoRequestValidationTests
{
    private static ValidationResult? Validate(object model, string property)
    {
        var results = new List<ValidationResult>();
        var context = new ValidationContext(model) { MemberName = property };
        Validator.TryValidateProperty(
            model.GetType().GetProperty(property)?.GetValue(model),
            context,
            results);
        return results.FirstOrDefault();
    }

    private static List<ValidationResult> ValidateObject(object model)
    {
        var results = new List<ValidationResult>();
        var context = new ValidationContext(model);
        Validator.TryValidateObject(model, context, results, validateAllProperties: true);
        return results;
    }

    private static ProdutoRequest ValidProduto() => new()
    {
        Codigo = 1,
        Descricao = "Produto Teste",
        CodigoBarras = "7891234567890",
        ValorVenda = 29.99m,
        PesoBruto = 1.500m,
        PesoLiquido = 1.200m
    };

    [Fact]
    public void Codigo_DefaultIsZero_ShouldFail()
    {
        var dto = new ProdutoRequest();
        var result = Validate(dto, nameof(ProdutoRequest.Codigo));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Be("Código deve ser um número positivo");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Codigo_ShouldFail_WhenNotPositive(int value)
    {
        var dto = new ProdutoRequest { Codigo = value };
        var result = Validate(dto, nameof(ProdutoRequest.Codigo));
        result.Should().NotBeNull();
    }

    [Fact]
    public void Descricao_ShouldBeRequired()
    {
        var dto = new ProdutoRequest();
        var result = Validate(dto, nameof(ProdutoRequest.Descricao));
        result.Should().NotBeNull();
    }

    [Fact]
    public void Descricao_ShouldFail_WhenExceeds60Chars()
    {
        var dto = new ProdutoRequest { Descricao = new string('A', 61) };
        var result = Validate(dto, nameof(ProdutoRequest.Descricao));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Contain("60");
    }

    [Fact]
    public void Descricao_ShouldPass_WhenWithin60Chars()
    {
        var dto = new ProdutoRequest { Descricao = new string('A', 60) };
        var result = Validate(dto, nameof(ProdutoRequest.Descricao));
        result.Should().BeNull();
    }

    [Fact]
    public void CodigoBarras_ShouldBeRequired()
    {
        var dto = new ProdutoRequest();
        var result = Validate(dto, nameof(ProdutoRequest.CodigoBarras));
        result.Should().NotBeNull();
    }

    [Fact]
    public void CodigoBarras_ShouldFail_WhenExceeds14Chars()
    {
        var dto = new ProdutoRequest { CodigoBarras = new string('0', 15) };
        var result = Validate(dto, nameof(ProdutoRequest.CodigoBarras));
        result.Should().NotBeNull();
    }

    [Fact]
    public void CodigoBarras_ShouldPass_WhenWithin14Chars()
    {
        var dto = new ProdutoRequest { CodigoBarras = "7891234567890" };
        var result = Validate(dto, nameof(ProdutoRequest.CodigoBarras));
        result.Should().BeNull();
    }

    [Fact]
    public void ValorVenda_ShouldBeRequired()
    {
        var dto = new ProdutoRequest();
        var result = Validate(dto, nameof(ProdutoRequest.ValorVenda));
        result.Should().NotBeNull();
    }

    [Theory]
    [InlineData(0.0)]
    [InlineData(-0.01)]
    public void ValorVenda_ShouldFail_WhenNotPositive(decimal value)
    {
        var dto = new ProdutoRequest { ValorVenda = value };
        var result = Validate(dto, nameof(ProdutoRequest.ValorVenda));
        result.Should().NotBeNull();
    }

    [Fact]
    public void ValorVenda_ShouldPass_WhenPositive()
    {
        var dto = new ProdutoRequest { ValorVenda = 10.99m };
        var result = Validate(dto, nameof(ProdutoRequest.ValorVenda));
        result.Should().BeNull();
    }

    [Fact]
    public void PesoBruto_ShouldBeRequired()
    {
        var dto = new ProdutoRequest();
        var result = Validate(dto, nameof(ProdutoRequest.PesoBruto));
        result.Should().NotBeNull();
    }

    [Theory]
    [InlineData(0.0)]
    [InlineData(-0.001)]
    public void PesoBruto_ShouldFail_WhenNotPositive(decimal value)
    {
        var dto = new ProdutoRequest { PesoBruto = value };
        var result = Validate(dto, nameof(ProdutoRequest.PesoBruto));
        result.Should().NotBeNull();
    }

    [Fact]
    public void PesoBruto_ShouldPass_WhenPositive()
    {
        var dto = new ProdutoRequest { PesoBruto = 0.500m };
        var result = Validate(dto, nameof(ProdutoRequest.PesoBruto));
        result.Should().BeNull();
    }

    [Fact]
    public void PesoLiquido_ShouldBeRequired()
    {
        var dto = new ProdutoRequest();
        var result = Validate(dto, nameof(ProdutoRequest.PesoLiquido));
        result.Should().NotBeNull();
    }

    [Theory]
    [InlineData(0.0)]
    [InlineData(-0.001)]
    public void PesoLiquido_ShouldFail_WhenNotPositive(decimal value)
    {
        var dto = new ProdutoRequest { PesoLiquido = value };
        var result = Validate(dto, nameof(ProdutoRequest.PesoLiquido));
        result.Should().NotBeNull();
    }

    [Fact]
    public void PesoLiquido_ShouldPass_WhenPositive()
    {
        var dto = new ProdutoRequest { PesoLiquido = 0.300m };
        var result = Validate(dto, nameof(ProdutoRequest.PesoLiquido));
        result.Should().BeNull();
    }

    [Fact]
    public void PesoLiquido_ShouldFail_WhenGreaterThanPesoBruto()
    {
        var dto = ValidProduto();
        dto.PesoBruto = 1.000m;
        dto.PesoLiquido = 2.000m;

        var results = ValidateObject(dto);

        results.Should().ContainSingle(r => r.ErrorMessage == "Peso Líquido não pode ser maior que o Peso Bruto");
    }

    [Fact]
    public void PesoLiquido_ShouldPass_WhenEqualToPesoBruto()
    {
        var dto = ValidProduto();
        dto.PesoBruto = 1.500m;
        dto.PesoLiquido = 1.500m;

        var results = ValidateObject(dto);

        results.Should().BeEmpty();
    }

    [Fact]
    public void CodigoBarras_ShouldFail_WhenNotNumeric()
    {
        var dto = new ProdutoRequest { CodigoBarras = "ABC123" };
        var result = Validate(dto, nameof(ProdutoRequest.CodigoBarras));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Be("Código de Barras deve conter apenas números");
    }

    [Fact]
    public void CodigoBarras_ShouldPass_WhenNumeric()
    {
        var dto = ValidProduto();
        var result = Validate(dto, nameof(ProdutoRequest.CodigoBarras));
        result.Should().BeNull();
    }
}
