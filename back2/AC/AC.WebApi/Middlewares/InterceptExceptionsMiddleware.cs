using AC.Core.Exceptions.BaseExceptions;
using AC.WebApi.Resources.Responses;
using Serilog;

namespace AC.WebApi.Middlewares;

public sealed class InterceptExceptionsMiddleware
{
    private readonly RequestDelegate _next;

    public InterceptExceptionsMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next.Invoke(context);
        }
        catch (InterceptableException exception)
        {
            Log.ForContext<InterceptExceptionsMiddleware>().Information(exception, "Exception intercepted");

            context.Response.StatusCode = (int)exception.StatusCode;
            await context.Response.WriteAsJsonAsync(new ExceptionIntercepionResponseResource
            {
                Code = exception.ExceptionCode.ToString()
            });
        }
    }
}