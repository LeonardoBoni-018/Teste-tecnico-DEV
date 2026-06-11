using System.ComponentModel.DataAnnotations;
using SoftLineTeste.Api.DTOs;
using FluentAssertions;

namespace SoftLineTeste.Tests.DTOs;

public class ClienteRequestValidationTests
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

    [Fact]
    public void Codigo_DefaultIsZero_ShouldFail()
    {
        var dto = new ClienteRequest();
        var result = Validate(dto, nameof(ClienteRequest.Codigo));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Be("Código deve ser um número positivo");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Codigo_ShouldFail_WhenNotPositive(int value)
    {
        var dto = new ClienteRequest { Codigo = value };
        var result = Validate(dto, nameof(ClienteRequest.Codigo));
        result.Should().NotBeNull();
    }

    [Fact]
    public void Nome_ShouldBeRequired()
    {
        var dto = new ClienteRequest();
        var result = Validate(dto, nameof(ClienteRequest.Nome));
        result.Should().NotBeNull();
    }

    [Fact]
    public void Nome_ShouldFail_WhenExceeds60Chars()
    {
        var dto = new ClienteRequest { Nome = new string('A', 61) };
        var result = Validate(dto, nameof(ClienteRequest.Nome));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Contain("60");
    }

    [Fact]
    public void Nome_ShouldPass_WhenWithin60Chars()
    {
        var dto = new ClienteRequest { Nome = new string('A', 60) };
        var result = Validate(dto, nameof(ClienteRequest.Nome));
        result.Should().BeNull();
    }

    [Fact]
    public void Fantasia_ShouldBeRequired()
    {
        var dto = new ClienteRequest();
        var result = Validate(dto, nameof(ClienteRequest.Fantasia));
        result.Should().NotBeNull();
    }

    [Fact]
    public void Fantasia_ShouldFail_WhenExceeds100Chars()
    {
        var dto = new ClienteRequest { Fantasia = new string('A', 101) };
        var result = Validate(dto, nameof(ClienteRequest.Fantasia));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Contain("100");
    }

    [Fact]
    public void Fantasia_ShouldPass_WhenWithin100Chars()
    {
        var dto = new ClienteRequest { Fantasia = new string('A', 100) };
        var result = Validate(dto, nameof(ClienteRequest.Fantasia));
        result.Should().BeNull();
    }

    [Fact]
    public void Documento_ShouldBeRequired()
    {
        var dto = new ClienteRequest();
        var result = Validate(dto, nameof(ClienteRequest.Documento));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Be("Documento é obrigatório");
    }

    [Fact]
    public void Documento_ShouldFail_WhenInvalidCpf()
    {
        var dto = new ClienteRequest { Documento = "12345678901" };
        var result = Validate(dto, nameof(ClienteRequest.Documento));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Be("CPF inválido");
    }

    [Fact]
    public void Documento_ShouldPass_WhenValidCpf()
    {
        var dto = new ClienteRequest { Documento = "529.982.247-25" };
        var result = Validate(dto, nameof(ClienteRequest.Documento));
        result.Should().BeNull();
    }

    [Fact]
    public void Documento_ShouldPass_WhenValidCpfRaw()
    {
        var dto = new ClienteRequest { Documento = "52998224725" };
        var result = Validate(dto, nameof(ClienteRequest.Documento));
        result.Should().BeNull();
    }

    [Fact]
    public void Documento_ShouldFail_WhenInvalidCnpj()
    {
        var dto = new ClienteRequest { Documento = "11222333000100" };
        var result = Validate(dto, nameof(ClienteRequest.Documento));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Be("CNPJ inválido");
    }

    [Fact]
    public void Documento_ShouldPass_WhenValidCnpj()
    {
        var dto = new ClienteRequest { Documento = "11.222.333/0001-81" };
        var result = Validate(dto, nameof(ClienteRequest.Documento));
        result.Should().BeNull();
    }

    [Fact]
    public void Documento_ShouldPass_WhenValidCnpjRaw()
    {
        var dto = new ClienteRequest { Documento = "11222333000181" };
        var result = Validate(dto, nameof(ClienteRequest.Documento));
        result.Should().BeNull();
    }

    [Fact]
    public void Documento_ShouldFail_WhenWrongLength()
    {
        var dto = new ClienteRequest { Documento = "123456" };
        var result = Validate(dto, nameof(ClienteRequest.Documento));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Be("Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos");
    }

    [Fact]
    public void Endereco_ShouldBeRequired()
    {
        var dto = new ClienteRequest();
        var result = Validate(dto, nameof(ClienteRequest.Endereco));
        result.Should().NotBeNull();
    }

    [Fact]
    public void Endereco_ShouldFail_WhenExceeds500Chars()
    {
        var dto = new ClienteRequest { Endereco = new string('A', 501) };
        var result = Validate(dto, nameof(ClienteRequest.Endereco));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Contain("500");
    }

    [Fact]
    public void Endereco_ShouldPass_WhenWithin500Chars()
    {
        var dto = new ClienteRequest { Endereco = new string('A', 500) };
        var result = Validate(dto, nameof(ClienteRequest.Endereco));
        result.Should().BeNull();
    }
}
