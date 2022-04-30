using FluentValidation;

namespace AC.WebApi.Resources.Requests.Validators;

public sealed class CreateSaveRequestResourceValidator : AbstractValidator<CreateSaveRequestResource>
{
    public CreateSaveRequestResourceValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(256);

        RuleFor(x => x.Data)
            .NotEmpty()
            .MaximumLength(10 * 1024 * 1024);
    }
}