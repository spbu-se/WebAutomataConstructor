using System.Net;

namespace AC.Core.Exceptions.BaseExceptions;

public abstract class NotFoundException : InterceptableException
{
    public override HttpStatusCode StatusCode => HttpStatusCode.NotFound;

    protected NotFoundException()
    {
    }

    protected NotFoundException(string message) : base(message)
    {
    }

    protected NotFoundException(string message, Exception inner) : base(message, inner)
    {
    }
}