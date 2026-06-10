using System.Collections.Concurrent;

namespace SoftLineTeste.Api.Services;

public class RateLimiterMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ConcurrentDictionary<string, RateLimitEntry> _entries = new();
    private readonly int _maxRequests;
    private readonly TimeSpan _window;

    public RateLimiterMiddleware(RequestDelegate next, int maxRequests = 10, int windowSeconds = 60)
    {
        _next = next;
        _maxRequests = maxRequests;
        _window = TimeSpan.FromSeconds(windowSeconds);
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments("/api/auth/login"))
        {
            var key = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var entry = _entries.GetOrAdd(key, _ => new RateLimitEntry());

            lock (entry)
            {
                if (DateTime.UtcNow - entry.StartTime > _window)
                {
                    entry.StartTime = DateTime.UtcNow;
                    entry.Count = 1;
                }
                else if (entry.Count >= _maxRequests)
                {
                    context.Response.StatusCode = 429;
                    context.Response.Headers["Retry-After"] = _window.TotalSeconds.ToString();
                    return;
                }
                else
                {
                    entry.Count++;
                }
            }
        }

        await _next(context);
    }

    private class RateLimitEntry
    {
        public DateTime StartTime { get; set; } = DateTime.UtcNow;
        public int Count { get; set; }
    }
}
