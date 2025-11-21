using FarmaciaAPI.Data;
using FarmaciaAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FarmaciaAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BannersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env; // Para saber onde salvar a imagem
    private readonly IConfiguration _config;   // Para ler a senha do appsettings

    public BannersController(AppDbContext context, IWebHostEnvironment env, IConfiguration config)
    {
        _context = context;
        _env = env;
        _config = config;
    }

    // GET: api/banners
    // (Esse é público, o site usa para mostrar as fotos)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Banner>>> GetBanners()
    {
        return await _context.Banners.ToListAsync();
    }

    // POST: api/banners/upload
    // (Esse é protegido por senha! Salva imagem + dados)
   [HttpPost("upload")]
    public async Task<ActionResult<Banner>> UploadBanner(
        [FromForm] IFormFile imagem, 
        [FromForm] string? titulo, 
        [FromForm] string? descricao,
        [FromHeader(Name = "x-senha-admin")] string senhaEnviada)
    {
        // 1. Verifica Senha
        if (senhaEnviada != _config["SenhaAdmin"]) return Unauthorized("Senha incorreta.");

        // 2. Verifica se tem arquivo
        if (imagem == null || imagem.Length == 0) return BadRequest("Nenhuma imagem enviada.");

        // 3. VERIFICAÇÃO DE SEGURANÇA (NOVO!)
        // Limite de 5MB (5 * 1024 * 1024 bytes)
        if (imagem.Length > 5 * 1024 * 1024) return BadRequest("A imagem deve ter no máximo 5MB.");

        // Só aceita imagens
        var extensoesPermitidas = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var extensao = Path.GetExtension(imagem.FileName).ToLowerInvariant();
        if (!extensoesPermitidas.Contains(extensao)) return BadRequest("Formato inválido. Use JPG, PNG ou WEBP.");

        // 4. Prepara pasta
        string webRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        string pastaDestino = Path.Combine(webRootPath, "imagens");
        if (!Directory.Exists(pastaDestino)) Directory.CreateDirectory(pastaDestino);

        // 5. Nome Único e Seguro
        string nomeArquivo = Guid.NewGuid().ToString() + extensao;
        string caminhoCompleto = Path.Combine(pastaDestino, nomeArquivo);

        // 6. Salva
        using (var stream = new FileStream(caminhoCompleto, FileMode.Create))
        {
            await imagem.CopyToAsync(stream);
        }

        // 7. Banco
        var novoBanner = new Banner
        {
            Titulo = titulo,
            Descricao = descricao,
            ImagemUrl = $"/imagens/{nomeArquivo}"
        };

        _context.Banners.Add(novoBanner);
        await _context.SaveChangesAsync();

        return Ok(novoBanner);
    }

    // DELETE: api/banners/5
    // (Protegido por senha também)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBanner(int id, [FromHeader(Name = "x-senha-admin")] string senhaEnviada)
    {
        // 1. SEGURANÇA: Verifica se a senha bate com a do appsettings.json
        // Se a senha for diferente, retorna erro 401 (Não autorizado)
        if (senhaEnviada != _config["SenhaAdmin"])
        {
            return Unauthorized(new { message = "Senha incorreta. Você não pode apagar isso." });
        }

        // 2. Procura o banner no banco
        var banner = await _context.Banners.FindAsync(id);
        if (banner == null)
        {
            return NotFound(new { message = "Banner não encontrado." });
        }

        // 3. LIMPEZA: Tenta apagar o arquivo físico da pasta (opcional, mas recomendado)
        try 
        {
            // Pega o caminho da pasta wwwroot
            string webRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            
            // banner.ImagemUrl vem como "/imagens/foto.jpg", precisamos arrumar as barras
            string caminhoRelativo = banner.ImagemUrl.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString());
            string caminhoArquivo = Path.Combine(webRootPath, caminhoRelativo);

            if (System.IO.File.Exists(caminhoArquivo))
            {
                System.IO.File.Delete(caminhoArquivo);
            }
        }
        catch (Exception ex)
        {
            // Se der erro ao apagar o arquivo (ex: arquivo em uso), a gente apenas loga
            // mas CONTINUA para apagar do banco, senão o dado fica preso lá pra sempre.
            Console.WriteLine($"Erro ao apagar arquivo: {ex.Message}");
        }

        // 4. Apaga do Banco de Dados
        _context.Banners.Remove(banner);
        await _context.SaveChangesAsync();

        return NoContent(); // Retorna 204 (Sucesso, sem conteúdo)
    }
}