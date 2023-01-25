"use strict";

const form = document.querySelector(".form");
const formContainer = document.querySelector(".form_container");
const formConMyProd = document.querySelector(".form_container_myProducts");
const formMyProducts = document.querySelector(".form_myProducts");
const formAlreadyAdded = document.querySelector(".alreadyAdded_confirm");
const myProductsRow = document.querySelector(".myProducts_row");
const btnForm = document.querySelector(".form__btn");
const btnSort = document.querySelector(".nav__btn-sort");
const btnShare = document.querySelector(".nav__btn-share");
const btnClear = document.querySelector(".nav__btn-clear");
const btnTrashYes = document.querySelector(".trash_confirm_yes");
const btnTrashNo = document.querySelector(".trash_confirm_no");
const btnAddedYes = document.querySelector(".alreadyAddedconfirm_yes");
const btnAddedNo = document.querySelector(".alreadyAddedconfirm_no");
const btnMyProducts = document.querySelector(".nav__btn-myProducts");
const btnAddMyProducts = document.querySelector(".myProducts_form_submit");
const btnBack = document.querySelector(".myProducts_form_back");
const trashConf = document.querySelector(".trash_confirm");
const inputProduct = document.querySelector(".form_product");
const inputQuantity = document.querySelector(".form_quantity");
const inputPrice = document.querySelector(".form_price");
const list = document.querySelector(".list");
const listRow = document.querySelector(".list__row");
const inputId = document.getElementById("form-id");
const listCost = document.querySelector(".list_cost_value");
const checkboxSelectAll = document.querySelector(".form_checkbox_selectall");
// const formCheckbox = document.querySelectorAll(".form_checkbox");
let inputBought = document.getElementById("form-bought");
let hiddenProduct = document.getElementById("hiddenProduct");
let clicks = 0;

const sortDesc = [
  "addition",
  "products ascending",
  "products descending",
  "quantity",
];
const sortDescription = document.querySelector(".sort_description");
let editButtonActive = false;
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
  #myProducts = [];

  constructor() {
    this._getLocalStorage();
    this._getMyProductsLocal();

    btnForm.addEventListener("click", this._buttonFunction.bind(this));
    btnShare.addEventListener("click", this._shareList.bind(this));
    btnClear.addEventListener("click", this.trashConfirm);
    btnTrashYes.addEventListener("click", this.reset);
    btnTrashNo.addEventListener("click", this.trashConfirm);
    // btnAddedYes.addEventListener("click", this._addProduct.bind(this));
    btnAddedNo.addEventListener("click", this.alreadyAddedHidde);
    btnMyProducts.addEventListener("click", this._showMyProducts.bind(this));
    btnAddMyProducts.addEventListener("click", this._addMyProducts.bind(this));
    list.addEventListener("click", this._editProduct.bind(this));
    list.addEventListener("click", this._bought.bind(this));
    list.addEventListener("click", this._removeProduct.bind(this));
    btnSort.addEventListener("click", this._sortList.bind(this));
    btnBack.addEventListener("click", this._updateProductList.bind(this));
    inputQuantity.addEventListener("change", this._form2Decimal);
    inputPrice.addEventListener("change", this._form2Decimal);
    checkboxSelectAll.addEventListener(
      "change",
      this._checkboxSelectAll.bind(this)
    );
    let products;

    this.buttonSign();
    this._calculateCost();
  }

  _form2Decimal(e) {
    const el = e.target;
    let elValue = el.value;
    elValue = Math.trunc(parseFloat(elValue * 100)) / 100;
    el.value = elValue;
  }

  _calculateCost() {
    cost = 0;
    this.#productsList.forEach(
      (prod) => (cost = cost + prod.quantity * prod.price)
    );

    listCost.innerHTML = "";
    listCost.insertAdjacentHTML(
      "beforeend",
      `<span> ${cost.toFixed(2)} $</span>`
    );
  }

  _shareList() {
    let shareDataArr = [];

    this.#productsList.forEach((prod) => {
      shareDataArr.push(` ${prod.product} ${prod.quantity}`);
    });
    const data = shareDataArr.toString().replaceAll(",", "\n");
    const shareData = {
      text: data,
    };

    navigator.share(shareData);
  }

  trashConfirm() {
    trashConf.classList.toggle("hidden");
  }

  alreadyAddedHidde() {
    formAlreadyAdded.classList.toggle("hidden");
  }

  buttonSign() {
    btnForm.innerHTML = "";
    !editButtonActive
      ? (icon = `<ion-icon name="add-outline"></ion-icon>`)
      : (icon = `<ion-icon name="save-outline"></ion-icon>`);
    btnForm.insertAdjacentHTML("afterbegin", icon);
  }

  _buttonFunction(e) {
    e.preventDefault();
    !editButtonActive ? this._addNewProduct() : this._saveProduct();
  }

  _clearForm() {
    inputProduct.value = inputQuantity.value = inputPrice.value = "";
    editButtonActive = false;
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

    editButtonActive = true;
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
    this._clearForm();
    this.buttonSign();
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
    editButtonActive = false;
    this.buttonSign();
  }

  _addNewProduct(productName) {
    let product = "";
    let quantity = 0;
    let price = 0;
    const bought = false;
    if (productName) {
      product = productName;
      quantity = 1;
      price = 0;
    } else {
      // get data from form

      product = inputProduct.value;
      quantity = +inputQuantity.value;
      price = +inputPrice.value;
    }

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
    this._saveMyProducts(products.product);

    // render product on list
    this._renderProductList(products);

    // empty imputs
    this._clearForm();
    inputProduct.focus();

    // set local storage
    this._setLocalStorage();

    this._calculateCost();
  }

  _saveMyProducts(product) {
    if (
      !this.#myProducts.some(
        (prod) => prod.toLowerCase() == product.toLowerCase()
      )
    )
      this.#myProducts.push(product);

    localStorage.setItem("myProducts", JSON.stringify(this.#myProducts));
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

    list.insertAdjacentHTML(
      `${!products.bought ? "afterbegin" : "beforeend"}`,
      html
    );
  }

  _updateProductList(products) {
    if (!formConMyProd.classList.contains("hidden"))
      formConMyProd.classList.add("hidden");
    list.innerHTML = "";
    this.#productsList.forEach((prod) => this._renderProductList(prod));
    this._calculateCost();
    this._setLocalStorage();
  }

  _renderMyProducts(product) {
    const html = `
    <label class="label_row"><input class="form_checkbox" type="checkbox" value="${product}" /> ${product}</label>
    `;

    formMyProducts.insertAdjacentHTML("afterbegin", html);
  }

  _addMyProducts(e) {
    e.preventDefault();

    const productRow = e.target.parentNode.previousElementSibling;
    for (let i = 0; i < productRow.length; i++) {
      let productName = productRow[i].value;
      if (productRow[i].checked) {
        this._addNewProduct(productName);
      }
    }

    this._updateProductList();
    checkboxSelectAll.checked = false;
  }

  _showMyProducts() {
    this._getMyProductsLocal();
    list.innerHTML = "";
    formConMyProd.classList.remove("hidden");
    formMyProducts.innerHTML = "";

    this.#myProducts.forEach((prod) => this._renderMyProducts(prod));
  }

  _checkboxSelectAll(e) {
    let formCheckbox = e.target.parentNode.nextElementSibling;
    formCheckbox.addEventListener("change", function () {
      for (let i = 0; i < formCheckbox.length; i++) {
        if (formCheckbox[i].checked === false) {
          checkboxSelectAll.checked = false;
          break;
        } else {
          checkboxSelectAll.checked = true;
        }
      }
    });

    if (e.target.checked) {
      for (let i = 0; i < formCheckbox.length; i++) {
        formCheckbox[i].checked = true;
      }
    } else {
      for (let i = 0; i < formCheckbox.length; i++) {
        formCheckbox[i].checked = false;
      }
    }
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
    if (!formConMyProd.classList.contains("hidden"))
      formConMyProd.classList.add("hidden");
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

  _getMyProductsLocal() {
    const myProductsData = JSON.parse(localStorage.getItem("myProducts"));
    if (!myProductsData) return;
    this.#myProducts = myProductsData;
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
    // localStorage.removeItem("myProducts");
    location.reload();
    trashConfirm();
  }
}

const app = new App();
