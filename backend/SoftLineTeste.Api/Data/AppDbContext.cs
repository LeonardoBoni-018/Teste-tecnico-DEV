using Microsoft.EntityFrameworkCore;
using SoftLineTeste.Api.Models;

namespace SoftLineTeste.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Produto> Produtos { get; set; }
    public DbSet<Cliente> Clientes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Produto>(entity =>
        {
            entity.HasIndex(p => p.Codigo).IsUnique();
            entity.Property(p => p.ValorVenda).HasColumnType("decimal(18,2)");
            entity.Property(p => p.PesoBruto).HasColumnType("decimal(18,3)");
            entity.Property(p => p.PesoLiquido).HasColumnType("decimal(18,3)");
        });

        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.HasIndex(c => c.Codigo).IsUnique();
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasIndex(u => u.Username).IsUnique();
        });
    }
}
