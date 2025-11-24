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
        // Domingo
        aberto = hora >= 8 && (hora < 21 || (hora === 21 && agora.getMinutes() < 30));
    } else {
        // Segunda a Sábado
        aberto = hora >= 8 && hora < 22;
    }

    if (aberto) {
        statusEl.textContent = "Aberto agora";
        statusEl.style.color = "#28a745";
    } else {
        statusEl.textContent = "Fechado agora";
        statusEl.style.color = "#dc3545";
    }
    statusEl.style.fontWeight = "700"; 

    // ==================================================
    // 2. CARROSSEL DINÂMICO
    // ==================================================
    
    // Deixe vazio para usar o mesmo servidor
    const API_BASE_URL = ""; 

    async function carregarBanners() {
        try {
            // Busca os dados na API (/api/banners)
            const response = await fetch(`${API_BASE_URL}/api/banners`);
            const banners = await response.json();

            const slidesContainer = document.querySelector(".slides");
            const dotsContainer = document.querySelector(".indicators");

            // Limpa containers
            slidesContainer.innerHTML = "";
            dotsContainer.innerHTML = "";

            if (banners.length === 0) {
                // Banner padrão se não houver nada no banco
                slidesContainer.innerHTML = '<div class="slide active"><img src="./imgs/logo.jpeg"><div class="slide-caption"><h2>Bem-vindo</h2></div></div>';
                return;
            }

            // Cria o HTML para cada banner
            banners.forEach((banner, index) => {
                
                // Cria a DIV do Slide
                const slideDiv = document.createElement("div");
                slideDiv.classList.add("slide");
                if (index === 0) slideDiv.classList.add("active");

                // Monta URL completa da imagem
                const imgUrl = `${API_BASE_URL}${banner.imagemUrl}`;

                slideDiv.innerHTML = `
                    <img src="${imgUrl}" alt="${banner.titulo}" onerror="this.src='./imgs/logo.jpeg'">
                    <div class="slide-caption">
                        <h2>${banner.titulo || ""}</h2>
                        <p>${banner.descricao || ""}</p>
                    </div>
                `;
                slidesContainer.appendChild(slideDiv);

                // Cria a Bolinha (Dot)
                const dot = document.createElement("span");
                dot.classList.add("dot");
                if (index === 0) dot.classList.add("active");
                
                dot.addEventListener("click", () => {
                    index = index; // Atualiza índice local
                    mostrarSlideEspecifico(index);
                });

                dotsContainer.appendChild(dot);
            });

            // Inicia a rotação depois de criar os elementos
            iniciarRotacao(banners.length);

        } catch (error) {
            console.error("Erro ao buscar banners:", error);
            if(document.querySelector(".slides")) {
                document.querySelector(".slides").innerHTML = '<p style="padding:20px; text-align:center">Erro ao carregar promoções.</p>';
            }
        }
    }

    // Função para mudar o slide manualmente (pelos dots)
    function mostrarSlideEspecifico(n) {
        const slides = document.querySelectorAll(".slide");
        const dots = document.querySelectorAll(".dot");
        
        slides.forEach(s => s.classList.remove("active")); // O CSS cuida da transição
        dots.forEach(d => d.classList.remove("active"));

        if(slides[n]) slides[n].classList.add("active");
        if(dots[n]) dots[n].classList.add("active");
    }

    // Lógica de Controle (Next, Prev, AutoPlay)
    function iniciarRotacao(totalSlides) {
        let index = 0;

        function proximoSlide() {
            index = (index + 1) % totalSlides;
            mostrarSlideEspecifico(index);
        }

        function slideAnterior() {
            index = (index - 1 + totalSlides) % totalSlides;
            mostrarSlideEspecifico(index);
        }

        // Botões
        const btnNext = document.querySelector(".next");
        const btnPrev = document.querySelector(".prev");

        if(btnNext) btnNext.addEventListener("click", proximoSlide);
        if(btnPrev) btnPrev.addEventListener("click", slideAnterior);

        // AutoPlay
        let autoPlay = setInterval(proximoSlide, 5000);

        // Pausa no mouse
        const container = document.querySelector(".carousel-container");
        if(container) {
            container.addEventListener("mouseenter", () => clearInterval(autoPlay));
            container.addEventListener("mouseleave", () => {
                autoPlay = setInterval(proximoSlide, 5000);
            });
        }
    }

    carregarBanners();
});