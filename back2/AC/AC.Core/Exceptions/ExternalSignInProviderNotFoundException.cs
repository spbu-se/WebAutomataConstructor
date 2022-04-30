using AC.Core.Exceptions.BaseExceptions;

namespace AC.Core.Exceptions;

public sealed class ExternalSignInProviderNotFoundException : NotFoundException
{
    public override ExceptionCode ExceptionCode => ExceptionCode.ExternalSignInProviderNotFound;
    
    public ExternalSignInProviderNotFoundException()
    {
    }

    public ExternalSignInProviderNotFoundException(string message) : base(message)
    {
    }

    public ExternalSignInProviderNotFoundException(string message, Exception inner) : base(message, inner)
    {
    }
}