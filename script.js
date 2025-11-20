document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Lógica de Horário
    const statusEl = document.getElementById("status-farmacia");
    const agora = new Date();
    const hora = agora.getHours();
    const dia = agora.getDay(); // 0 = Domingo
    
    let aberto = false;

    // Domingo (Abre às 8h e fecha às 21h30)
    if (dia === 0) {
        aberto = hora >= 8 && (hora < 21 || (hora === 21 && agora.getMinutes() < 30));
    } 
    // Segunda a Sábado (Abre às 8h e fecha às 22h)
    else {
        aberto = hora >= 8 && hora < 22;
    }

    if (aberto) {
        statusEl.textContent = "Aberto agora";
        statusEl.style.color = "#28a745"; // Verde igual da foto
    } else {
        statusEl.textContent = "Fechado agora";
        statusEl.style.color = "#dc3545"; // Vermelho
    }
    // Remover negrito se quiser identico a foto, mas negrito ajuda a ler:
    statusEl.style.fontWeight = "700"; 

    // 2. Lógica do Carrossel
    const slides = document.querySelector(".slides");
    const slideImages = document.querySelectorAll(".slide");
    const dots = document.querySelectorAll(".dot");
    let index = 0;
    const totalSlides = slideImages.length;

    function updateCarousel() {
        slides.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach(dot => dot.classList.remove("active"));
        dots[index].classList.add("active");
    }

    document.querySelector(".next").addEventListener("click", () => {
        index = (index + 1) % totalSlides;
        updateCarousel();
    });

    document.querySelector(".prev").addEventListener("click", () => {
        index = (index - 1 + totalSlides) % totalSlides;
        updateCarousel();
    });

    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            index = i;
            updateCarousel();
        });
    });

    let autoPlay = setInterval(() => {
        index = (index + 1) % totalSlides;
        updateCarousel();
    }, 5000);

    const container = document.querySelector(".carousel-container");
    container.addEventListener("mouseenter", () => clearInterval(autoPlay));
    container.addEventListener("mouseleave", () => {
        autoPlay = setInterval(() => {
            index = (index + 1) % totalSlides;
            updateCarousel();
        }, 5000);
    });
});