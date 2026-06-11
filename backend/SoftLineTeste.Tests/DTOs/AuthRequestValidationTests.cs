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
        var dto = new LoginRequest { Username = "abc", Password = "123456" };
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
        var dto = new LoginRequest { Username = "abc", Password = "123456" };
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
        var dto = new LoginRequest { Username = "admin", Password = "123456" };
        var results = ValidateObject(dto);
        results.Should().BeEmpty();
    }

    // ========== RegisterRequest ==========

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
            Password = "123456",
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
    public void RegisterRequest_Password_ShouldFail_WhenLessThan6Chars()
    {
        var dto = new RegisterRequest { Password = "12345" };
        var result = ValidateProperty(dto, nameof(RegisterRequest.Password));
        result.Should().NotBeNull();
        result!.ErrorMessage.Should().Contain("6");
    }

    [Fact]
    public void RegisterRequest_Password_ShouldPass_When6OrMoreChars()
    {
        var dto = new RegisterRequest
        {
            Username = "user",
            Password = "123456",
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
            Password = "123456",
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
            Password = "123456",
            Nome = "New User"
        };
        var results = ValidateObject(dto);
        results.Should().BeEmpty();
    }
}
