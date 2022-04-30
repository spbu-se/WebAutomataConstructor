using System.Net;

namespace AC.Core.Exceptions.BaseExceptions;

public abstract class BadRequestException : InterceptableException
{
    public override HttpStatusCode StatusCode => HttpStatusCode.BadRequest;

    protected BadRequestException()
    {
    }

    protected BadRequestException(string message) : base(message)
    {
    }

    protected BadRequestException(string message, Exception inner) : base(message, inner)
    {
    }
}