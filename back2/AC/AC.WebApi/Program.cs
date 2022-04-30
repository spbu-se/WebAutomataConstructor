using System.Reflection;
using AC.Core.Exceptions;
using AC.Core.Models;
using AC.Core.Options;
using AC.Data;
using AC.Services;
using AC.WebApi.Extensions;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((_, loggerConfiguration) =>
{
    loggerConfiguration
        .MinimumLevel.Information()
        .WriteTo.Console();
});

// Add services to the container.

builder.Services.AddCors(x =>
{
    x.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyHeader();
        policy.AllowAnyMethod();
        policy.WithOrigins(builder.Configuration.GetSection("Cors:Origin").Value);
        policy.AllowCredentials();
    });
});

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Auth:Jwt"));
builder.Services.Configure<GoogleSignInProviderOptions>(builder.Configuration.GetSection("Auth:Externals:Google"));
builder.Services.Configure<YandexSignInProviderOptions>(builder.Configuration.GetSection("Auth:Externals:Yandex"));
builder.Services.Configure<AuthRedirectsOptions>(builder.Configuration.GetSection("Auth:Redirects"));

builder.Services.AddDbContext<DatabaseContext>(x =>
    x.UseNpgsql(builder.Configuration.GetConnectionString("Main")));

builder.Services.AddIdentity<User, Role>(x =>
    {
        x.Password.RequireDigit = false;
        x.Password.RequiredLength = 6;
        x.Password.RequireLowercase = false;
        x.Password.RequireUppercase = false;
        x.Password.RequireNonAlphanumeric = false;
    })
    .AddEntityFrameworkStores<DatabaseContext>()
    .AddDefaultTokenProviders();

builder.Services.AddAuth(
    builder.Configuration.GetSection("Auth:Jwt").Get<JwtOptions>(),
    builder.Configuration.GetSection("Auth:Externals:Google").Get<GoogleSignInProviderOptions>(),
    builder.Configuration.GetSection("Auth:Externals:Yandex").Get<YandexSignInProviderOptions>()
);

builder.Services.AddAutoMapper(typeof(Program));

builder.Services.AddFluentValidation(x =>
    x.RegisterValidatorsFromAssembly(Assembly.GetExecutingAssembly()));

builder.Services.AddTransient<IAuthService, AuthService>();
builder.Services.AddTransient<ISavesService, SaveService>();
builder.Services.AddTransient<IUserService, UserService>();

builder.Services
    .AddControllers()
    .ConfigureApiBehaviorOptions(x =>
    {
        x.InvalidModelStateResponseFactory = context =>
        {
            var errors = string.Join("; ", context.ModelState.Values
                .Where(v => v.Errors.Count > 0)
                .SelectMany(v => v.Errors)
                .Select(v => v.ErrorMessage)
            );

            Log.Information("Validation error: {Errors}", errors);

            return new BadRequestObjectResult(new { Code = ExceptionCode.ValidationFailed.ToString() });
        };
    });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwagger();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionsInterception();

app.UseHttpsRedirection();

app.UseCors();

app.UseAuth();

app.MapControllers();

app.Run();