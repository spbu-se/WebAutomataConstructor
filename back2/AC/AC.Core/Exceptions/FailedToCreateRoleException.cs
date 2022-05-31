using AC.Core.Exceptions.BaseExceptions;

namespace AC.Core.Exceptions;

public sealed class FailedToCreateRoleException : BadRequestException
{
    public override ExceptionCode ExceptionCode => ExceptionCode.FailedToCreateRole;

    public FailedToCreateRoleException()
    {
    }

    public FailedToCreateRoleException(string message) : base(message)
    {
    }

    public FailedToCreateRoleException(string message, Exception inner) : base(message, inner)
    {
    }
}