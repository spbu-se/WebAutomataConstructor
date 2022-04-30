using AC.Core.Exceptions.BaseExceptions;

namespace AC.Core.Exceptions;

public sealed class FailedToCreateUserException : BadRequestException
{
    public override ExceptionCode ExceptionCode => ExceptionCode.FailedToCreateUser;

    public FailedToCreateUserException()
    {
    }

    public FailedToCreateUserException(string message) : base(message)
    {
    }

    public FailedToCreateUserException(string message, Exception inner) : base(message, inner)
    {
    }
}