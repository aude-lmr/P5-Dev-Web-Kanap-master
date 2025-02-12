"use strict";

// Récupération du numéro de commande dans l'URL
function getNumOrder() {
  let urlSearchParams = new URLSearchParams(window.location.search);
  return urlSearchParams.get("numero");
}

// Affichage du numéro de commande sur la page et vidage du localstorage
const numOrder = getNumOrder();
document.getElementById("orderId").textContent = `${numOrder}.`;
localStorage.clear();
