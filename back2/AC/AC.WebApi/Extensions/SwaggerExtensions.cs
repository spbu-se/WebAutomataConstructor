using System.Reflection;
using Microsoft.OpenApi.Models;

namespace AC.WebApi.Extensions;

public static class SwaggerExtensions
{
    public static IServiceCollection AddSwagger(this IServiceCollection services)
    {
        return services.AddSwaggerGen(x =>
        {
            x.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "JWT containing userid claim",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
            });

            var security = new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Id = "Bearer",
                            Type = ReferenceType.SecurityScheme
                        },
                        UnresolvedReference = true
                    },
                    new List<string>()
                }
            };

            x.AddSecurityRequirement(security);
            
            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            x.IncludeXmlComments(xmlPath);
        });
    }
}