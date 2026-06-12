using System.ComponentModel.DataAnnotations;
using SoftLineTeste.Api.DTOs;
using FluentAssertions;

namespace SoftLineTeste.Tests.DTOs;

public class AuthRequestValidationTests
{
    private static ValidationResult? ValidateProperty(object model, string property)
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

    // ========== LoginRequest ==========

    [Fact]
    public void LoginRequest_Username_ShouldBeRequired()
    {
        var dto = new LoginRequest();
        var result = ValidateProperty(dto, nameof(LoginRequest.Username));
        result.Should().NotBeNull();
    }

    [Fact]
    public void LoginRequest_Username_ShouldFail_WhenLessThan3Chars()
    {
        var dto = new LoginRequest { Username = "ab" };
        var result = ValidateProperty(dto, nameof(LoginRequest.Username));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Contain("3");
    }

    [Fact]
    public void LoginRequest_Username_ShouldPass_When3OrMoreChars()
    {
        var dto = new LoginRequest { Username = "abc", Password = "Admin@123" };
        var result = ValidateProperty(dto, nameof(LoginRequest.Username));
        result.Should().BeNull();
    }

    [Fact]
    public void LoginRequest_Password_ShouldBeRequired()
    {
        var dto = new LoginRequest();
        var result = ValidateProperty(dto, nameof(LoginRequest.Password));
        result.Should().NotBeNull();
    }

    [Fact]
    public void LoginRequest_Password_ShouldFail_WhenLessThan6Chars()
    {
        var dto = new LoginRequest { Password = "12345" };
        var result = ValidateProperty(dto, nameof(LoginRequest.Password));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Contain("6");
    }

    [Fact]
    public void LoginRequest_Password_ShouldPass_When6OrMoreChars()
    {
        var dto = new LoginRequest { Username = "abc", Password = "Admin@123" };
        var result = ValidateProperty(dto, nameof(LoginRequest.Password));
        result.Should().BeNull();
    }

    [Fact]
    public void LoginRequest_ShouldHaveValidationErrors_WhenEmpty()
    {
        var dto = new LoginRequest();
        var results = ValidateObject(dto);
        results.Should().HaveCount(2);
    }

    [Fact]
    public void LoginRequest_ShouldPass_WhenValid()
    {
        var dto = new LoginRequest { Username = "admin@email.com", Password = "Admin@123" };
        var results = ValidateObject(dto);
        results.Should().BeEmpty();
    }

    // ========== RegisterRequest ==========

    private const string ValidPassword = "Admin@123";

    [Fact]
    public void RegisterRequest_Username_ShouldBeRequired()
    {
        var dto = new RegisterRequest();
        var result = ValidateProperty(dto, nameof(RegisterRequest.Username));
        result.Should().NotBeNull();
    }

    [Fact]
    public void RegisterRequest_Username_ShouldFail_WhenLessThan3Chars()
    {
        var dto = new RegisterRequest { Username = "ab" };
        var result = ValidateProperty(dto, nameof(RegisterRequest.Username));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Contain("3");
    }

    [Fact]
    public void RegisterRequest_Username_ShouldFail_WhenExceeds50Chars()
    {
        var dto = new RegisterRequest { Username = new string('a', 51) };
        var result = ValidateProperty(dto, nameof(RegisterRequest.Username));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Contain("50");
    }

    [Fact]
    public void RegisterRequest_Username_ShouldPass_WhenWithinRange()
    {
        var dto = new RegisterRequest
        {
            Username = "validuser",
            Password = ValidPassword,
            Nome = "Valid User"
        };
        var result = ValidateProperty(dto, nameof(RegisterRequest.Username));
        result.Should().BeNull();
    }

    [Fact]
    public void RegisterRequest_Password_ShouldBeRequired()
    {
        var dto = new RegisterRequest();
        var result = ValidateProperty(dto, nameof(RegisterRequest.Password));
        result.Should().NotBeNull();
    }

    [Fact]
    public void RegisterRequest_Password_ShouldFail_WhenLessThan8Chars()
    {
        var dto = new RegisterRequest { Password = "Ab@1" };
        var result = ValidateProperty(dto, nameof(RegisterRequest.Password));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Contain("8");
    }

    [Fact]
    public void RegisterRequest_Password_ShouldFail_WhenMissingUppercase()
    {
        var dto = new RegisterRequest { Password = "admin@123" };
        var result = ValidateProperty(dto, nameof(RegisterRequest.Password));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Contain("maiúscula");
    }

    [Fact]
    public void RegisterRequest_Password_ShouldFail_WhenMissingLowercase()
    {
        var dto = new RegisterRequest { Password = "ADMIN@123" };
        var result = ValidateProperty(dto, nameof(RegisterRequest.Password));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Contain("minúscula");
    }

    [Fact]
    public void RegisterRequest_Password_ShouldFail_WhenMissingNumber()
    {
        var dto = new RegisterRequest { Password = "Admin@abc" };
        var result = ValidateProperty(dto, nameof(RegisterRequest.Password));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Contain("número");
    }

    [Fact]
    public void RegisterRequest_Password_ShouldFail_WhenMissingSpecialChar()
    {
        var dto = new RegisterRequest { Password = "Admin1234" };
        var result = ValidateProperty(dto, nameof(RegisterRequest.Password));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Contain("especial");
    }

    [Fact]
    public void RegisterRequest_Password_ShouldPass_WhenMeetsComplexity()
    {
        var dto = new RegisterRequest
        {
            Username = "user",
            Password = ValidPassword,
            Nome = "User"
        };
        var result = ValidateProperty(dto, nameof(RegisterRequest.Password));
        result.Should().BeNull();
    }

    [Fact]
    public void RegisterRequest_Nome_ShouldBeRequired()
    {
        var dto = new RegisterRequest();
        var result = ValidateProperty(dto, nameof(RegisterRequest.Nome));
        result.Should().NotBeNull();
    }

    [Fact]
    public void RegisterRequest_Nome_ShouldFail_WhenExceeds100Chars()
    {
        var dto = new RegisterRequest { Nome = new string('A', 101) };
        var result = ValidateProperty(dto, nameof(RegisterRequest.Nome));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Contain("100");
    }

    [Fact]
    public void RegisterRequest_Nome_ShouldPass_WhenWithin100Chars()
    {
        var dto = new RegisterRequest
        {
            Username = "user",
            Password = ValidPassword,
            Nome = new string('A', 100)
        };
        var result = ValidateProperty(dto, nameof(RegisterRequest.Nome));
        result.Should().BeNull();
    }

    [Fact]
    public void RegisterRequest_ShouldHaveValidationErrors_WhenEmpty()
    {
        var dto = new RegisterRequest();
        var results = ValidateObject(dto);
        results.Should().HaveCount(3);
    }

    [Fact]
    public void RegisterRequest_ShouldPass_WhenValid()
    {
        var dto = new RegisterRequest
        {
            Username = "newuser",
            Password = ValidPassword,
            Nome = "New User"
        };
        var results = ValidateObject(dto);
        results.Should().BeEmpty();
    }
}
