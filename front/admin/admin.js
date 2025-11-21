// URL da API (Verifique se sua porta é 5200 mesmo no terminal)
const API_BASE_URL = "http://localhost:5087"; 
const API_URL = `${API_BASE_URL}/api/banners`;

// 1. Carregar Lista de Banners ao abrir a página
async function carregarLista() {
    try {
        const res = await fetch(API_URL);
        const banners = await res.json();
        
        const container = document.getElementById('listaBanners');
        container.innerHTML = "";

        if (banners.length === 0) {
            container.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Nenhum banner no site.</p>";
            return;
        }

        banners.forEach(b => {
            // URL da imagem completa
            const imgUrl = `${API_BASE_URL}${b.imagemUrl}`;
            
            container.innerHTML += `
                <div class="banner-item">
                    <img src="${imgUrl}" alt="Banner" onerror="this.src='./imgs/logo.jpeg'">
                    <div class="banner-info">
                        <h4>${b.titulo || "Sem título"}</h4>
                        <p>${b.descricao || "Sem descrição"}</p>
                    </div>
                    <button class="btn-delete" onclick="deletarBanner(${b.id})">Apagar</button>
                </div>
            `;
        });
    } catch (err) {
        console.error(err);
        document.getElementById('listaBanners').innerHTML = "<p style='color:red'>Erro ao conectar com a API.</p>";
    }
}

// 2. Enviar Banner (POST)
async function enviarBanner() {
    const senha = document.getElementById('senhaAdmin').value;
    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;
    const imagem = document.getElementById('imagemInput').files[0];
    const msg = document.getElementById('msg');

    if (!senha || !imagem) {
        msg.style.color = "#dc2626"; 
        msg.innerText = "Erro: Senha e Imagem são obrigatórios."; 
        return;
    }

    const formData = new FormData();
    formData.append("imagem", imagem);
    formData.append("titulo", titulo);
    formData.append("descricao", descricao);

    msg.innerText = "Enviando...";
    msg.style.color = "#333";

    try {
        const res = await fetch(`${API_URL}/upload`, {
            method: "POST",
            headers: { "x-senha-admin": senha },
            body: formData
        });

        if (res.ok) {
            msg.style.color = "#166534"; 
            msg.innerText = "Sucesso! Banner enviado.";
            
            // Limpar campos
            document.getElementById('titulo').value = "";
            document.getElementById('descricao').value = "";
            document.getElementById('imagemInput').value = "";
            
            // Atualiza a lista visualmente
            carregarLista(); 
        } else {
            // Tenta pegar mensagem de erro da API ou usa genérica
            const erro = await res.json().catch(() => ({}));
            msg.style.color = "#dc2626"; 
            msg.innerText = "Erro: " + (erro.mensagem || "Senha incorreta ou erro no servidor.");
        }
    } catch (err) {
        msg.style.color = "#dc2626"; 
        msg.innerText = "Erro de conexão com a API.";
    }
}

// 3. Deletar Banner (DELETE)
async function deletarBanner(id) {
    const senha = document.getElementById('senhaAdmin').value;
    
    if(!senha) { 
        alert("Por favor, digite a senha no campo 'Senha de Segurança' lá em cima para confirmar a exclusão."); 
        document.getElementById('senhaAdmin').focus();
        return; 
    }

    if(!confirm("Tem certeza que quer tirar esse banner do ar?")) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: { "x-senha-admin": senha }
        });
        
        if(res.ok) {
            carregarLista(); // Recarrega a lista
        } else {
            alert("Erro ao apagar. Verifique se a senha está correta.");
        }
    } catch(err) {
        alert("Erro de conexão ao tentar apagar.");
    }
}

// Inicia carregando a lista assim que o script roda
carregarLista();