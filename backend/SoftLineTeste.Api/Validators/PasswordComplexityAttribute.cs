using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace SoftLineTeste.Api.Validators;

public partial class PasswordComplexityAttribute : ValidationAttribute
{
    private static readonly Regex PasswordRegex = MyRegex();

    [GeneratedRegex(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]).{8,}$")]
    private static partial Regex MyRegex();

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not string password || string.IsNullOrWhiteSpace(password))
            return new ValidationResult("Senha é obrigatória");

        if (password.Length < 8)
            return new ValidationResult("Senha deve ter no mínimo 8 caracteres");

        if (!PasswordRegex.IsMatch(password))
            return new ValidationResult("Senha deve conter letra maiúscula, minúscula, número e caractere especial");

        return ValidationResult.Success;
    }
}
