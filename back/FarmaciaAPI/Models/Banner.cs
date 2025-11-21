namespace FarmaciaAPI.Models;

public class Banner
{
    public int Id { get; set; }
    
    // Título da promoção (ex: "Ofertas da Semana")
    public string? Titulo { get; set; }
    
    // Descrição curta (ex: "Economize em medicamentos")
    public string? Descricao { get; set; }
    
    // Onde a imagem foi salva no servidor (ex: "/imagens/promo1.jpg")
    public string ImagemUrl { get; set; } = string.Empty;
}