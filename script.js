

document.addEventListener("DOMContentLoaded", () => {
      document.body.style.opacity = "1";
  const statusEl = document.getElementById("status-farmacia");
  const agora = new Date();
  const hora = agora.getHours();
  const dia = agora.getDay(); 
  let aberto = false;

  if (dia === 0) {
    
    aberto = hora < 21 || (hora === 21 && agora.getMinutes() < 30);
  } else {
  
    aberto = hora >= 8 && hora < 22;
  }

  statusEl.textContent = aberto ? "Aberto agora" : "Fechado";
  statusEl.style.fontWeight = "600";
  statusEl.style.color = aberto ? "#28a745" : "#d63031";
});
