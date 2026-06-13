using System.ComponentModel.DataAnnotations;

namespace SoftLineTeste.Api.Validators;

public class CpfCnpjAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext context)
    {
        var doc = value?.ToString()?.Replace(".", "").Replace("-", "").Replace("/", "");

        // Presença é responsabilidade do [Required]; aqui validamos apenas o formato/dígitos.
        if (string.IsNullOrEmpty(doc))
            return ValidationResult.Success;

        if (doc.Length == 11)
            return IsValidCpf(doc) ? ValidationResult.Success
                : new ValidationResult("CPF inválido");

        if (doc.Length == 14)
            return IsValidCnpj(doc) ? ValidationResult.Success
                : new ValidationResult("CNPJ inválido");

        return new ValidationResult("Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos");
    }

    private static bool IsValidCpf(string cpf)
    {
        if (cpf.All(c => c == cpf[0])) return false;

        var sum1 = 0;
        for (var i = 0; i < 9; i++)
            sum1 += (cpf[i] - '0') * (10 - i);
        var rest1 = sum1 % 11;
        var dig1 = rest1 < 2 ? 0 : 11 - rest1;

        if (cpf[9] - '0' != dig1) return false;

        var sum2 = 0;
        for (var i = 0; i < 10; i++)
            sum2 += (cpf[i] - '0') * (11 - i);
        var rest2 = sum2 % 11;
        var dig2 = rest2 < 2 ? 0 : 11 - rest2;

        return cpf[10] - '0' == dig2;
    }

    private static bool IsValidCnpj(string cnpj)
    {
        if (cnpj.All(c => c == cnpj[0])) return false;

        var multipliers1 = new[] { 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
        var sum1 = 0;
        for (var i = 0; i < 12; i++)
            sum1 += (cnpj[i] - '0') * multipliers1[i];
        var rest1 = sum1 % 11;
        var dig1 = rest1 < 2 ? 0 : 11 - rest1;

        if (cnpj[12] - '0' != dig1) return false;

        var multipliers2 = new[] { 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
        var sum2 = 0;
        for (var i = 0; i < 13; i++)
            sum2 += (cnpj[i] - '0') * multipliers2[i];
        var rest2 = sum2 % 11;
        var dig2 = rest2 < 2 ? 0 : 11 - rest2;

        return cnpj[13] - '0' == dig2;
    }
}
