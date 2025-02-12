"use strict";
// Récupération des produits à afficher sur la page d'accueil
fetch("http://localhost:3000/api/products/")
  .then(function (res) {
    if (res.ok) {
      return res.json();
    }
  })
  .then(function (items) {
    let htmlItems = document.getElementById("items");
    for (let item of items) {
      htmlItems.innerHTML += `<a href="./product.html?id=${item._id}">
          <article>
            <img src="${item.imageUrl}" alt="${item.altTxt}">
            <h3 class="productName">${item.name}</h3>
            <p class="productDescription">${item.description}</p>
          </article>
      </a>`;
    }
  })
  .catch(function (error) {
    // Une erreur est survenue
  });
