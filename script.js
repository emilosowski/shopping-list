"use strict";

const form = document.querySelector(".form");
const formContainer = document.querySelector(".form_container");
const btnForm = document.querySelector(".form__btn");
const btnSort = document.querySelector(".nav__btn-sort");
const btnClear = document.querySelector(".nav__btn-clear");
const inputProduct = document.querySelector(".form_product");
const inputQuantity = document.querySelector(".form_quantity");
const inputPrice = document.querySelector(".form_price");
const list = document.querySelector(".list");
const listRow = document.querySelector(".list__row");
const inputId = document.getElementById("form-id");
const listCost = document.querySelector(".list_cost");
let inputBought = document.getElementById("form-bought");
let clicks = 0;
const sortDesc = [
  "addition",
  "products ascending",
  "products descending",
  "quantity",
];
const sortDescription = document.querySelector(".sort_description");
let editButton = 0;
let icon;
let cost = 0;

class ShoppingList {
  // id ostatnie 10 cyfr daty
  id = (Date.now() + "").slice(-10);

  constructor(product, quantity, price, bought) {
    this.product = product;
    this.quantity = quantity;
    this.price = price;
    this.bought = bought;
  }
}

class App {
  #productsList = [];

  constructor() {
    this._getLocalStorage();

    btnForm.addEventListener("click", this._buttonFunction.bind(this));
    btnClear.addEventListener("click", this.reset);
    list.addEventListener("click", this._editProduct.bind(this));
    list.addEventListener("click", this._bought.bind(this));
    list.addEventListener("click", this._removeProduct.bind(this));
    btnSort.addEventListener("click", this._sortList.bind(this));
    let products;
    this.buttonSign();
  }

  _calculateCost() {
    this.#productsList.forEach(
      (prod) => (cost = cost + prod.quantity * prod.price)
    );
    console.log(cost);
    listCost.insertAdjacentHTML("beforeend", `<span> ${cost} $</span>`);
  }

  buttonSign() {
    btnForm.innerHTML = "";
    editButton === 0
      ? (icon = `<ion-icon name="add-outline"></ion-icon>`)
      : (icon = `<ion-icon name="save-outline"></ion-icon>`);
    btnForm.insertAdjacentHTML("afterbegin", icon);
  }

  _buttonFunction(e) {
    e.preventDefault();
    editButton === 0 ? this._addNewProduct() : this._saveProduct();
  }

  _clearForm() {
    inputProduct.value = inputQuantity.value = inputPrice.value = "";
  }

  _editProduct(e) {
    const productEl = e.target.closest(".list__edit-item");

    if (!productEl) return;
    const product = this.#productsList.find(
      (pr) => pr.id === productEl.dataset.id
    );

    inputProduct.value = product.product;
    inputQuantity.value = product.quantity;
    inputPrice.value = product.price;
    inputId.value = product.id;
    inputBought = product.bought;

    editButton = 1;
    this.buttonSign();
  }

  _removeProduct(e) {
    const productEl = e.target.closest(".list__remove-item");

    if (!productEl) return;

    const productsListId = this.#productsList.findIndex(
      (x) => x.id === productEl.dataset.id
    );

    this.#productsList.splice(productsListId, 1);
    this._updateProductList();
  }

  _saveProduct() {
    // e.preventDefault();
    // get data from form
    const product = inputProduct.value;
    const quantity = +inputQuantity.value;
    const price = +inputPrice.value;
    const id = inputId.value;
    const bought = inputBought;
    // check if data is valid
    if (
      !product ||
      !Number.isFinite(quantity) ||
      quantity < 0 ||
      !Number.isFinite(price) ||
      price < 0
    )
      return alert(
        "Product name is required, quantity and price have to be positive numbers or 0"
      );

    // update object

    const productsListId = this.#productsList.findIndex((x) => x.id === id);

    this.#productsList[productsListId].product = product;
    this.#productsList[productsListId].quantity = quantity;
    this.#productsList[productsListId].price = price;
    this.#productsList[productsListId].bought = bought;

    // render product on list

    this._updateProductList(this.#productsList[productsListId]);
    this._clearForm();
    editButton = 0;
    this.buttonSign();
  }

  _addNewProduct() {
    // get data from form
    const product = inputProduct.value;
    const quantity = +inputQuantity.value;
    const price = +inputPrice.value;
    const bought = false;

    // check if data is valid
    if (
      !product ||
      !Number.isFinite(quantity) ||
      quantity < 0 ||
      !Number.isFinite(price) ||
      price < 0
    )
      return alert(
        "Product name is required, quantity and price have to be positive numbers or 0"
      );

    // create object
    const products = new ShoppingList(product, quantity, price, bought);

    // add object to array

    this.#productsList.push(products);

    // render product on list
    this._renderProductList(products);

    // empty imputs
    this._clearForm();
    inputProduct.focus();

    // set local stprage
    this._setLocalStorage();
  }

  _renderProductList(products) {
    listRow.innerHTML = "";

    const html = `<div class="list__row" >
    <div class="list__type" ${
      products.bought ? 'style = "background-color: #7fff90"' : ""
    }></div>
    <div class="list__icon" ${
      products.bought ? "style = 'color: #7fff90'" : ""
    } data-id=${products.id}>
    <ion-icon name="checkmark-done-circle-outline"></ion-icon>
    </div>
    <div class="list__item ${products.bought ? "line-through" : ""}">${
      products.product
    }</div>
    <div class="list__quantity">${products.quantity}</div>
    <div class="list__price">${products.price}</div>
    <div class="list__edit-item" data-id=${products.id}>
    <ion-icon name="pencil-outline"></ion-icon>
    </div>
    <div class="list__remove-item" data-id=${products.id}>
    <ion-icon name="trash-outline" ></ion-icon>
    </div>`;

    list.insertAdjacentHTML("afterbegin", html);
  }

  _updateProductList(products) {
    list.innerHTML = "";
    this.#productsList.forEach((prod) => this._renderProductList(prod));
  }

  _bought(e) {
    const iconEl = e.target.closest(".list__icon");
    if (!iconEl) return;

    const product = this.#productsList.find(
      (pr) => pr.id === iconEl.dataset.id
    );
    product.bought === true
      ? (product.bought = false)
      : (product.bought = true);

    const productName = iconEl.nextElementSibling;
    const iconType = iconEl.previousSibling.previousSibling;

    this._updateProductList();
  }

  _sortList(e) {
    e.preventDefault();
    // 0 - sorted by id addition order
    // 1 - sorted by product name ascending
    // 2 - sorted by product name descending
    // 3 - sorted by quantity
    clicks++;
    clicks === 4 ? (clicks = 0) : (clicks = clicks);
    let products;
    if (clicks === 0) {
      products = this.#productsList.sort((a, b) => a.id - b.id);
    }
    if (clicks === 1) {
      products = this.#productsList.sort((a, b) =>
        a.product.toUpperCase() < b.product.toUpperCase()
          ? 1
          : a.product.toUpperCase() > b.product.toUpperCase()
          ? -1
          : 0
      );
    }
    if (clicks === 2) {
      products = this.#productsList.sort((a, b) =>
        a.product.toUpperCase() < b.product.toUpperCase()
          ? -1
          : a.product.toUpperCase() > b.product.toUpperCase()
          ? 1
          : 0
      );
    }
    if (clicks === 3) {
      products = this.#productsList.sort((a, b) => b.quantity - a.quantity);
    }

    this._updateProductList();

    sortDescription.innerHTML = "";
    sortDescription.insertAdjacentHTML("afterbegin", sortDesc[clicks]);
  }

  _setLocalStorage() {
    localStorage.setItem("products", JSON.stringify(this.#productsList));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("products"));

    if (!data) return;
    this.#productsList = data;

    this.#productsList.forEach((prod) => {
      this._renderProductList(prod);
    });
  }

  reset() {
    localStorage.removeItem("products");
    location.reload();
  }
}

const app = new App();
app._calculateCost();
