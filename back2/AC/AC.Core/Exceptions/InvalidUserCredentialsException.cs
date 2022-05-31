using AC.Core.Exceptions.BaseExceptions;

namespace AC.Core.Exceptions;

public sealed class InvalidUserCredentialsException : BadRequestException
{
    public override ExceptionCode ExceptionCode => ExceptionCode.InvalidUserCredentials;

    public InvalidUserCredentialsException()
    {
    }

    public InvalidUserCredentialsException(string message) : base(message)
    {
    }

    public InvalidUserCredentialsException(string message, Exception inner) : base(message, inner)
    {
    }
}