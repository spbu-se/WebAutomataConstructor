using FluentValidation;

namespace AC.WebApi.Resources.Requests.Validators;

public sealed class UpdateUserRequestResourceValidator : AbstractValidator<UpdateUserRequestResource>
{
    public UpdateUserRequestResourceValidator()
    {
        When(
            x => x.About is not null,
            () => RuleFor(x => x.About)
                .NotEmpty()
                .MaximumLength(10 * 1024)
        );
    }
}