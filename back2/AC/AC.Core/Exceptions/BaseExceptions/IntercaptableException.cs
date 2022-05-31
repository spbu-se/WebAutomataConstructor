using System.Net;

namespace AC.Core.Exceptions.BaseExceptions;

public abstract class InterceptableException : Exception
{
    public abstract ExceptionCode ExceptionCode { get; }

    public abstract HttpStatusCode StatusCode { get; }

    protected InterceptableException()
    {
    }

    protected InterceptableException(string message) : base(message)
    {
    }

    protected InterceptableException(string message, Exception inner) : base(message, inner)
    {
    }
}