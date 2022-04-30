using AC.Core.Exceptions.BaseExceptions;

namespace AC.Core.Exceptions;

public sealed class UserNotFoundException : NotFoundException
{
    public override ExceptionCode ExceptionCode => ExceptionCode.UserNotFound;

    public UserNotFoundException()
    {
    }

    public UserNotFoundException(string message) : base(message)
    {
    }

    public UserNotFoundException(string message, Exception inner) : base(message, inner)
    {
    }
}