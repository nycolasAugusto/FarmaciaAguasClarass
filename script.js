document.addEventListener("DOMContentLoaded", () => {

    // ANIMAÇÃO de fade-in
    document.body.style.opacity = "1";

    // STATUS da farmácia
    const statusEl = document.getElementById("status-farmacia");
    const agora = new Date();
    const hora = agora.getHours();
    const dia = agora.getDay();
    let aberto = false;

    // Domingo
    if (dia === 0) {
        aberto = hora < 21 || (hora === 21 && agora.getMinutes() < 30);
    } 
    // Segunda a sábado
    else {
        aberto = hora >= 8 && hora < 22;
    }

    statusEl.textContent = aberto ? "Aberto agora" : "Fechado";
    statusEl.style.fontWeight = "600";
    statusEl.style.color = aberto ? "#28a745" : "#d63031";

    // ===== CARROSSEL =====
    let index = 0;
    const slides = document.querySelectorAll(".slide");

    function showSlide(n) {
        const container = document.querySelector(".slides");
        container.style.transform = `translateX(${-n * 100}%)`;
    }

    document.querySelector(".next").addEventListener("click", () => {
        index = (index + 1) % slides.length;
        showSlide(index);
    });

    document.querySelector(".prev").addEventListener("click", () => {
        index = (index - 1 + slides.length) % slides.length;
        showSlide(index);
    });

    // Auto slide
    setInterval(() => {
        index = (index + 1) % slides.length;
        showSlide(index);
    }, 5000);
});
