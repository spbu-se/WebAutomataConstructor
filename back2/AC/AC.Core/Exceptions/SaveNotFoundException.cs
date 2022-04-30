using AC.Core.Exceptions.BaseExceptions;

namespace AC.Core.Exceptions;

public sealed class SaveNotFoundException : NotFoundException
{
    public override ExceptionCode ExceptionCode => ExceptionCode.SaveNotFound;

    public SaveNotFoundException()
    {
    }

    public SaveNotFoundException(string message) : base(message)
    {
    }

    public SaveNotFoundException(string message, Exception inner) : base(message, inner)
    {
    }
}