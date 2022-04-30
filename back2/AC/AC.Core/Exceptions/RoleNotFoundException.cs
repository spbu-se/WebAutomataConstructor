using AC.Core.Exceptions.BaseExceptions;

namespace AC.Core.Exceptions;

public sealed class RoleNotFoundException : NotFoundException
{
    public override ExceptionCode ExceptionCode => ExceptionCode.RoleNotFound;
    
    public RoleNotFoundException()
    {
    }

    public RoleNotFoundException(string message) : base(message)
    {
    }

    public RoleNotFoundException(string message, Exception inner) : base(message, inner)
    {
    }
}