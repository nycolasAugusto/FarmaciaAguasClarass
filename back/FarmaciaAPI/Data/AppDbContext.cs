using FarmaciaAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FarmaciaAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // Tabela de Banners
    public DbSet<Banner> Banners { get; set; }
}