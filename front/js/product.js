"use strict";
// Récupération de la chaine de requête dans l'URL
const queryString_url_id = window.location.search;

// Extraction de l'ID
let urlSearchParams = new URLSearchParams(queryString_url_id);
let id = urlSearchParams.get("id");

// Affichage du produit qui a été selectionné par l'id
// Avec fetch en mettant la valeur de l'id à la fin de l'url
fetch(`http://localhost:3000/api/products/${id}`)
  .then(function (res) {
    if (res.ok) {
      return res.json();
    }
  })
  .then(function (product) {
    let htmlProduct = document.getElementsByClassName("item")[0];

    htmlProduct.innerHTML = `<article>
      <div class="item__img"> <img src="${product.imageUrl}"> </div>
      <div class="item__content">
        <div class="item__content__titlePrice">
            <h1 id="title">${product.name}</h1>
            <p>Prix : <span id="price">${product.price}</span>€</p>
        </div>

      <div class="item__content__description">
        <p class="item__content__description__title">Description :</p>
        <p id="description">${product.description}</p>
      </div>
      
      <div class="item__content__settings">
              <div class="item__content__settings__color">
                <label for="color-select">Choisir une couleur :</label>
                <select name="color-select" id="colors">
                  <option value="">--SVP, choisissez une couleur --</option>
                
                </select>
              </div>

              <div class="item__content__settings__quantity">
                <label for="itemQuantity">Nombre d'article(s) (1-100) :</label>
                <input type="number" name="itemQuantity" min="1" max="100" value="0" id="quantity">
              </div>
            </div>

            <div class="item__content__addButton">
              <button id="addToCart" onclick="addToCartHandler()">Ajouter au panier</button>
            </div>
          </div>
        </article>`;

    let htmlColors = document.getElementById("colors");
    for (let color of product.colors) {
      htmlColors.innerHTML += `<option value="${color}">${color}</option>`;
    }
  })
  .catch(function (err) {
    // Une erreur est survenue
  });

function addToCartHandler() {
  // Récupérer le produit
  const quantity = document.getElementById("quantity").value;
  const color = document.getElementById("colors").value;

  if (color === "" || quantity === "") {
    alert("Merci de renseigner une couleur et une quantité.");
  } else {
    const product = { id: id, quantity: parseInt(quantity), color: color };
    addToLocalStorage(product);
  }
}

function addToLocalStorage(product) {
  // 1. Récupérer le tableau(le créer)
  let products = localStorage.getItem("products");
  if (products === null) {
    products = [];
  } else {
    products = JSON.parse(products);
  }

  // 2. Ajouter le produit dans le tableau
  let foundProduct = products.find(
    (p) => p.id === product.id && p.color === product.color
  );

  if (foundProduct != undefined) {
    foundProduct.quantity += parseInt(product.quantity);
  } else {
    products.push(product);
  }

  // 3. Sauvegarde le tableau
  saveCart(products);
}

function saveCart(products) {
  localStorage.setItem("products", JSON.stringify(products));
}
