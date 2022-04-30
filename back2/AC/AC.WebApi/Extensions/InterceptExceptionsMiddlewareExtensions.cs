using AC.WebApi.Middlewares;

namespace AC.WebApi.Extensions;

public static class InterceptExceptionsMiddlewareExtensions
{
    public static IApplicationBuilder UseExceptionsInterception(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<InterceptExceptionsMiddleware>();
    }
}