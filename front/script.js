document.addEventListener("DOMContentLoaded", () => {
    
    // ==================================================
    // 1. LÓGICA DE HORÁRIO (MANTIDA IGUAL AO SEU)
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

    if (aberto) {
        statusEl.textContent = "Aberto agora";
        statusEl.style.color = "#28a745";
    } else {
        statusEl.textContent = "Fechado agora";
        statusEl.style.color = "#dc3545";
    }
    statusEl.style.fontWeight = "700"; 

    // ==================================================
    // 2. CARROSSEL DINÂMICO (O NOVO CÓDIGO AQUI)
    // ==================================================
    
    // Porta da sua API (Verifique se é 5200 mesmo no terminal)
    const API_BASE_URL = "http://localhost:5087"; 

    async function carregarBanners() {
        try {
            // 1. Busca os dados na API
            const response = await fetch(`${API_BASE_URL}/api/banners`);
            const banners = await response.json();

            const slidesContainer = document.querySelector(".slides");
            const dotsContainer = document.querySelector(".indicators");

            // Limpa containers (garantia)
            slidesContainer.innerHTML = "";
            dotsContainer.innerHTML = "";

            if (banners.length === 0) {
                // Se não tiver banner, coloca uma imagem padrão
                slidesContainer.innerHTML = '<div class="slide active"><img src="./imgs/logo.jpeg"><div class="slide-caption"><h2>Bem-vindo</h2></div></div>';
                return;
            }

            // 2. Cria o HTML para cada banner que veio do banco
            banners.forEach((banner, index) => {
                
                // Cria a DIV do Slide
                const slideDiv = document.createElement("div");
                slideDiv.classList.add("slide");
                if (index === 0) slideDiv.classList.add("active"); // O primeiro aparece

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
                dotsContainer.appendChild(dot);
            });

            // 3. Inicia a rotação SÓ DEPOIS de criar os elementos
            iniciarRotacao(banners.length);

        } catch (error) {
            console.error("Erro ao buscar banners:", error);
            document.querySelector(".slides").innerHTML = '<p style="padding:20px; text-align:center">Erro ao carregar promoções.</p>';
        }
    }

    // Essa função controla os botões e o tempo (igual a antiga, mas encapsulada)
    function iniciarRotacao(totalSlides) {
        const slides = document.querySelectorAll(".slide");
        const dots = document.querySelectorAll(".dot");
        let index = 0;

        function updateCarousel() {
            const container = document.querySelector(".slides");
            container.style.transform = `translateX(-${index * 100}%)`;
            
            document.querySelectorAll(".dot").forEach(d => d.classList.remove("active"));
            if(dots[index]) dots[index].classList.add("active");
        }

        // Botões Next/Prev
        document.querySelector(".next").addEventListener("click", () => {
            index = (index + 1) % totalSlides;
            updateCarousel();
        });

        document.querySelector(".prev").addEventListener("click", () => {
            index = (index - 1 + totalSlides) % totalSlides;
            updateCarousel();
        });

        // Clique nas bolinhas
        dots.forEach((dot, i) => {
            dot.addEventListener("click", () => {
                index = i;
                updateCarousel();
            });
        });

        // AutoPlay
        let autoPlay = setInterval(() => {
            index = (index + 1) % totalSlides;
            updateCarousel();
        }, 5000);

        // Pausa no mouse
        const container = document.querySelector(".carousel-container");
        container.addEventListener("mouseenter", () => clearInterval(autoPlay));
        container.addEventListener("mouseleave", () => {
            autoPlay = setInterval(() => {
                index = (index + 1) % totalSlides;
                updateCarousel();
            }, 5000);
        });
    }

    // CHAMA A FUNÇÃO PARA COMEÇAR TUDO
    carregarBanners();
});