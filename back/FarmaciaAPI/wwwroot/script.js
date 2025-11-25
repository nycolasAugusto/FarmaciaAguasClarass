document.addEventListener("DOMContentLoaded", () => {
    
    // ==================================================
    // 1. LÓGICA DE HORÁRIO
    // ==================================================
    const statusEl = document.getElementById("status-farmacia");
    const agora = new Date();
    const hora = agora.getHours();
    const dia = agora.getDay(); 
    let aberto = false;

    if (dia === 0) {
        aberto = hora >= 8 && (hora < 21 || (hora === 21 && agora.getMinutes() < 30));
    } else {
        aberto = hora >= 8 && hora < 22;
    }

    if (statusEl) {
        if (aberto) {
            statusEl.textContent = "Aberto agora";
            statusEl.style.color = "#28a745";
        } else {
            statusEl.textContent = "Fechado agora";
            statusEl.style.color = "#dc3545";
        }
        statusEl.style.fontWeight = "700"; 
    }

    // ==================================================
    // 2. CARROSSEL DINÂMICO (CORRIGIDO)
    // ==================================================
    
    const API_BASE_URL = "https://farmaciaaguasclarass-1.onrender.com"; // Vazio para usar o mesmo domínio
    
    // Variáveis globais do carrossel
    let currentSlide = 0;
    let totalSlides = 0;
    let autoPlayInterval = null;

    async function carregarBanners() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/banners`);
            const banners = await response.json();

            const slidesContainer = document.querySelector(".slides");
            const dotsContainer = document.querySelector(".indicators");

            slidesContainer.innerHTML = "";
            dotsContainer.innerHTML = "";

            if (banners.length === 0) {
                slidesContainer.innerHTML = '<div class="slide active"><img src="./imgs/logo.jpeg"><div class="slide-caption"><h2>Bem-vindo</h2></div></div>';
                return;
            }

            // Atualiza o total de slides
            totalSlides = banners.length;

            banners.forEach((banner, index) => {
                // 1. Cria o Slide
                const slideDiv = document.createElement("div");
                slideDiv.classList.add("slide");
                if (index === 0) slideDiv.classList.add("active");

                const imgUrl = `${API_BASE_URL}${banner.imagemUrl}`;

                slideDiv.innerHTML = `
                    <img src="${imgUrl}" alt="${banner.titulo}" onerror="this.src='./imgs/logo.jpeg'">
                    <div class="slide-caption">
                        <h2>${banner.titulo || ""}</h2>
                        <p>${banner.descricao || ""}</p>
                    </div>
                `;
                slidesContainer.appendChild(slideDiv);

                // 2. Cria a Bolinha
                const dot = document.createElement("span");
                dot.classList.add("dot");
                if (index === 0) dot.classList.add("active");
                
                // Evento de clique na bolinha
                dot.addEventListener("click", () => {
                    irParaSlide(index);
                });

                dotsContainer.appendChild(dot);
            });

            // Inicia os botões e o autoplay
            configurarControles();
            iniciarAutoPlay();

        } catch (error) {
            console.error("Erro:", error);
        }
    }

    // Função Principal que move o carrossel
    function irParaSlide(n) {
        currentSlide = n;
        
        // 1. Move o container (O PULO DO GATO QUE FALTAVA)
        const container = document.querySelector(".slides");
        container.style.transform = `translateX(-${currentSlide * 100}%)`;

        // 2. Atualiza as bolinhas
        const dots = document.querySelectorAll(".dot");
        dots.forEach(d => d.classList.remove("active"));
        if(dots[currentSlide]) dots[currentSlide].classList.add("active");

        // Reinicia o tempo do autoplay para não pular rápido demais
        reiniciarAutoPlay();
    }

    function proximoSlide() {
        let next = (currentSlide + 1) % totalSlides;
        irParaSlide(next);
    }

    function slideAnterior() {
        let prev = (currentSlide - 1 + totalSlides) % totalSlides;
        irParaSlide(prev);
    }

    function configurarControles() {
        const btnNext = document.querySelector(".next");
        const btnPrev = document.querySelector(".prev");
        const container = document.querySelector(".carousel-container");

        if(btnNext) {
            // Remove listeners antigos para não duplicar
            const newNext = btnNext.cloneNode(true);
            btnNext.parentNode.replaceChild(newNext, btnNext);
            newNext.addEventListener("click", proximoSlide);
        }

        if(btnPrev) {
            const newPrev = btnPrev.cloneNode(true);
            btnPrev.parentNode.replaceChild(newPrev, btnPrev);
            newPrev.addEventListener("click", slideAnterior);
        }

        // Pausa no mouse
        if(container) {
            container.addEventListener("mouseenter", () => clearInterval(autoPlayInterval));
            container.addEventListener("mouseleave", iniciarAutoPlay);
        }
    }

    function iniciarAutoPlay() {
        clearInterval(autoPlayInterval); // Limpa anterior
        autoPlayInterval = setInterval(proximoSlide, 5000);
    }
    
    function reiniciarAutoPlay() {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(proximoSlide, 5000);
    }

    carregarBanners();
});