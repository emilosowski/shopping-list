"use strict";

const form = document.querySelector(".form");
const formContainer = document.querySelector(".form_container");
const btnOpenForm = document.querySelector(".nav__btn-add");
const btnCloseForm = document.querySelector(".form__btn-close");
const btnAddProduct = document.querySelector(".form__btn-add");
const btnSaveProduct = document.querySelector(".form__btn-save");
const inputProduct = document.querySelector(".form_product");
const inputQuantity = document.querySelector(".form_quantity");
const inputPrice = document.querySelector(".form_price");
const list = document.querySelector(".list");
const listRow = document.querySelector(".list__row");
const inputId = document.getElementById("form-id");
let inputBought = document.getElementById("form-bought");

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
    // this._getLocalStorage();
    btnOpenForm.addEventListener("click", this._openForm);
    btnCloseForm.addEventListener("click", this._closeForm);
    btnAddProduct.addEventListener("click", this._addNewProduct.bind(this));
    btnSaveProduct.addEventListener("click", this._saveProduct.bind(this));
    list.addEventListener("click", this._editProduct.bind(this));
    list.addEventListener("click", this._bought.bind(this));
    list.addEventListener("click", this._removeProduct.bind(this));
    let products;
  }

  _clearForm() {
    inputProduct.value = inputQuantity.value = inputPrice.value = "";
  }

  _openForm() {
    formContainer.classList.remove("hidden");
    btnSaveProduct.classList.add("hidden");
    btnAddProduct.classList.remove("hidden");
  }

  _closeForm(e) {
    e.preventDefault();
    formContainer.classList.add("hidden");
  }

  _editProduct(e) {
    const productEl = e.target.closest(".list__edit-item");

    if (!productEl) return;
    const product = this.#productsList.find(
      (pr) => pr.id === productEl.dataset.id
    );

    formContainer.classList.remove("hidden");

    inputProduct.value = product.product;
    inputQuantity.value = product.quantity;
    inputPrice.value = product.price;
    inputId.value = product.id;
    inputBought = product.bought;
    btnAddProduct.classList.add("hidden");
    btnSaveProduct.classList.remove("hidden");
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

  _saveProduct(e) {
    e.preventDefault();
    // get data from form
    const product = inputProduct.value;
    const quantity = +inputQuantity.value;
    const price = +inputPrice.value;
    const id = inputId.value;
    const bought = inputBought;
    console.log(this.#productsList);
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

    // console.log(this.#productsList);

    // render product on list

    this._updateProductList(this.#productsList[productsListId]);
    this._clearForm();
    formContainer.classList.add("hidden");
    console.log(this.#productsList);
  }

  _addNewProduct(e) {
    e.preventDefault();
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

    // set local stprage
    this._setLocalStorage();
    // console.log(this.#productsList);
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
    console.log(product.bought);
    const productName = iconEl.nextElementSibling;
    const iconType = iconEl.previousSibling.previousSibling;

    this._updateProductList();
    // if (product.bought) {
    //   productName.classList.add("line-through");
    //   iconEl.style.color = "#7fff90";
    //   iconType.style.backgroundColor = "#7fff90";
    // } else {
    //   iconEl.style.color = "#000";
    //   iconType.style.backgroundColor = "#ebc801";
    // }
  }

  _setLocalStorage() {
    localStorage.setItem("products", JSON.stringify(this.#productsList));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("products"));
    console.log(data);

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
