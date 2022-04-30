namespace AC.Core.Exceptions;

public enum ExceptionCode
{
    UserNotFound,
    InvalidUserCredentials,
    FailedToCreateUser,
    FailedToCreateRole,
    FailedToAssignRoleToUser,
    RoleNotFound,
    ExternalSignInProviderNotFound,
    SaveNotFound,
    ValidationFailed
}