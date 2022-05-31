using AC.Core.Exceptions.BaseExceptions;

namespace AC.Core.Exceptions;

public sealed class FailedToAssignRoleToUserException : BadRequestException
{
    public override ExceptionCode ExceptionCode => ExceptionCode.FailedToAssignRoleToUser;

    public FailedToAssignRoleToUserException()
    {
    }

    public FailedToAssignRoleToUserException(string message) : base(message)
    {
    }

    public FailedToAssignRoleToUserException(string message, Exception inner) : base(message, inner)
    {
    }
}