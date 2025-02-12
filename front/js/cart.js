"use strict";
// Récupération des données des produits
async function productsData(id) {
  let res = await fetch(`http://localhost:3000/api/products/${id}`);
  let data = await res.json();
  return data;
}

// Récupération du tableau dans le localStorage
async function getCart() {
  let products = localStorage.getItem("products");
  if (products === null) {
    products = [];
  } else {
    products = JSON.parse(products);
  }

  // Déclarer un objet item avec tous les paramètres nécessaire pour afficher le produit dans le panier :
  let cart = document.querySelector("#cart__items");
  for (let item of products) {
    let dataBaseItem = await productsData(item.id);

    const completeItem = {
      name: dataBaseItem.name,
      color: item.color,
      quantity: parseInt(item.quantity),
      price: dataBaseItem.price,
      imageUrl: dataBaseItem.imageUrl,
      altTxt: dataBaseItem.altTxt,
      id: item.id,
    };
    cart.innerHTML += builtItem(completeItem);
  }
  computeTotalQuantity(products);
  computeTotalPrice(products);
}
getCart();

//Construction d'un produit
function builtItem(item) {
  return `<article class="cart__item" data-id="${item.id}" data-color="${item.color}">
        <div class="cart__item__img">
        <img src="${item.imageUrl}" alt="${item.altTxt}">
        </div>
        <div class="cart__item__content">
        <div class="cart__item__content__description">
            <h2>${item.name}</h2>
            <p>${item.color}</p>
            <p>${item.price}€</p>
        </div>
        <div class="cart__item__content__settings">
            <div class="cart__item__content__settings__quantity">
            <p> Qté : ${item.quantity} </p>
            <input onchange="quantityChange(this)" type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${item.quantity}">
            </div>
            <div class="cart__item__content__settings__delete">
            <p class="deleteItem" onclick="deleteItem(this)" >Supprimer</p>
            </div>
        </div>
        </div>
    </article>`;
}

// Changer la quantité :
function quantityChange(event) {
  const id = event.closest("article").getAttribute("data-id");
  const color = event.closest("article").getAttribute("data-color");
  const quantity = event.value;
  const paragraphe = event.previousElementSibling;

  paragraphe.textContent = "Qté : " + quantity;

  let cartProducts = JSON.parse(localStorage.getItem("products"));
  for (let item of cartProducts) {
    if (item.id === id && item.color === color) {
      item.quantity = parseInt(quantity);
    }
  }
  localStorage.setItem("products", JSON.stringify(cartProducts));

  computeTotalQuantity(cartProducts);
  computeTotalPrice(cartProducts);
}

// Suppression d'un article du panier :
function deleteItem(event) {
  const id = event.closest("article").getAttribute("data-id");
  const color = event.closest("article").getAttribute("data-color");
  const article = event.closest("article");
  article.remove();

  let cartProducts = JSON.parse(localStorage.getItem("products"));
  for (let i = 0; i < cartProducts.length; i++) {
    if (cartProducts[i].id === id && cartProducts[i].color === color) {
      cartProducts.splice(i, 1);
    }
  }
  localStorage.setItem("products", JSON.stringify(cartProducts));

  // Calculer la somme total des produits
  computeTotalQuantity(cartProducts);
  computeTotalPrice(cartProducts);
}

// Calculer la quantité totale d'articles
function computeTotalQuantity(cartProducts) {
  let sumQuantity = 0;
  for (let i = 0; i < cartProducts.length; i++) {
    sumQuantity += cartProducts[i].quantity;
  }
  const articles = document.getElementById("totalQuantity");
  articles.textContent = sumQuantity;
}

// Calculer le prix total
async function computeTotalPrice(cartProducts) {
  let totalPrice = 0;
  for (let i = 0; i < cartProducts.length; i++) {
    const quantity = cartProducts[i].quantity;
    const productData = await productsData(cartProducts[i].id);
    const price = productData.price;
    const productsSum = quantity * price;
    totalPrice += productsSum;
  }
  const article = document.getElementById("totalPrice");
  article.textContent = totalPrice;
}

// Passer la commande - Objet contact
async function saveOrder() {
  //
  let contact = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    address: document.getElementById("address").value,
    city: document.getElementById("city").value,
    email: document.getElementById("email").value,
  };

  // Produits de la commande - Tableau des produits
  let products = [];
  const productsOrder = JSON.parse(localStorage.getItem("products"));
  for (let i = 0; i < productsOrder.length; i++) {
    const id = productsOrder[i].id;
    products.push(id);
  }

  //Informations contact et panier produits du client enregistrés dans un objet
  let dataUser = { contact: contact, products: products };

  let response = await fetch("http://localhost:3000/api/products/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(dataUser),
  });

  let result = await response.json();

  let orderId = result.orderId;

  await confirmationPageCall(orderId);
}

const submitBtn = document.getElementById("order");
submitBtn.addEventListener("click", submit);

// Validation du formulaire
function validateForm() {
  // Récupération des élements du formulaire
  const firstNameInput = document.getElementById("firstName").value;
  const lastNameInput = document.getElementById("lastName").value;
  const addressInput = document.getElementById("address").value;
  const cityInput = document.getElementById("city").value;
  const email = document.getElementById("email").value;

  //Définition des regex pour la validation
  const firstNameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/; // Only letters and underscores allowed
  const lastNameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/; // Only letters and underscores allowed
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const addressRegex = /^(.+)$/;
  const cityRegex = /^[a-zA-Z\s'-]+$/;

  //Définition des messages d'erreurs
  const firstNameErrorMsg = document.getElementById("firstNameErrorMsg");
  const lastNameErrorMsg = document.getElementById("lastNameErrorMsg");
  const addressErrorMsg = document.getElementById("addressErrorMsg");
  const cityErrorMsg = document.getElementById("cityErrorMsg");
  const emailErrorMsg = document.getElementById("emailErrorMsg");

  // Réinitialisation des messages d'erreur
  firstNameErrorMsg.textContent = "";
  lastNameErrorMsg.textContent = "";
  emailErrorMsg.textContent = "";
  addressErrorMsg.textContent = "";
  cityErrorMsg.textContent = "";

  let isValid = true;

  // Validation prénom
  if (!firstNameRegex.test(firstNameInput)) {
    isValid = false;
    firstNameErrorMsg.textContent =
      "Veuillez renseigner votre prénom en utilisant uniquement des lettres ou des tirets.";
  }
  // Validation nom
  if (!lastNameRegex.test(lastNameInput)) {
    isValid = false;
    lastNameErrorMsg.textContent =
      "Veuillez renseigner votre prénom en utilisant uniquement des lettres ou des tirets.";
  }

  // Validation email
  if (!emailRegex.test(email)) {
    isValid = false;
    emailErrorMsg.textContent =
      "Veuillez respecter le format du courriel. (exemple@domaine.fr)";
  }

  // Validation addresse
  if (!addressRegex.test(addressInput)) {
    isValid = false;
    addressErrorMsg.textContent = "Veuillez renseigner votre adresse.";
  }

  // Validation ville
  if (!cityRegex.test(cityInput)) {
    isValid = false;
    cityErrorMsg.textContent = "Veuillez renseigner votre ville.";
  }

  return isValid;
}

// Vérification et submission du formulaire
async function submit(event) {
  event.preventDefault(); // Empêche le formulaire d'être soumis par défaut

  // Submission du formulaire
  if (validateForm()) {
    await saveOrder();
  }
}

// Redirection vers la page de confirmation
async function confirmationPageCall(orderId) {
  const urlConfirmation = `/front/html/confirmation.html?numero=${orderId}`;
  window.location.href = urlConfirmation;
}
