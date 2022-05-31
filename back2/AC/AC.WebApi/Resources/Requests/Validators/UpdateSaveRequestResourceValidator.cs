using FluentValidation;

namespace AC.WebApi.Resources.Requests.Validators;

public sealed class UpdateSaveRequestResourceValidator : AbstractValidator<UpdateSaveRequestResource>
{
    public UpdateSaveRequestResourceValidator()
    {
        When(
            x => x.Name is not null,
            () => RuleFor(x => x.Name)
                .NotEmpty()
                .MaximumLength(256)
        );

        When(
            x => x.Data is not null,
            () => RuleFor(x => x.Data)
                .NotEmpty()
                .MaximumLength(10 * 1024 * 1024)
        );
    }
}