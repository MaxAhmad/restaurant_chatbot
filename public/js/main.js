const socket = io("https://ye-restaurant-chatbot.onrender.com/");

socket.on("connected", function (msg) {
  console.log(msg);
});

// In memory Current orders
const orders = [];

const orderModal = document.querySelector(".order-modal");
const historyModal = document.querySelector(".history-modal");
const checkoutModal = document.querySelector(".checkout-modal");
const currentModal = document.querySelector(".current-modal");
const cancelModal = document.querySelector(".cancel-modal");

const overlay = document.querySelector(".overlay");

const btnCloseModal = document.querySelector(".close-modal");
const btnCloseHistoryModal = document.querySelector(".close-history-modal");
const btnCloseCheckoutModal = document.querySelector(".close-checkout-modal");
const btnCloseCurrentModal = document.querySelector(".close-current-modal");
const btnCloseCancelModal = document.querySelector(".close-cancel-modal");

const btnsOpenItemsModal = document.querySelector(".show-items-modal");
const btnsOpenCheckoutModal = document.querySelector(".show-checkout-modal");
const btnsOpenHistoryModal = document.querySelector(".show-history-modal");
const btnsOpenCancelModal = document.querySelector(".show-cancel-modal");
const btnsOpenCurrentModal = document.querySelector(".show-current-modal");

const foodMenuItems = document.querySelector(".menu-items");
const placeOrder = document.getElementById("orderButton");
const historyItems = document.getElementById("items");
const historyPrice = document.getElementById("price");
const currentPrice = document.getElementById("current_price");
const currentItems = document.getElementById("current_items");

let order_value = document.getElementById("order-field");

const openOrderModal = function () {
  orderModal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

const closeModal = function () {
  orderModal.classList.add("hidden");
  overlay.classList.add("hidden");
};

const openHistoryModal = function () {
  if (Object.keys(orders).length === 0) {
    alert("you have not made an order, Please click on 1 to make an order");
    return;
  }
  historyModal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

const closeHistoryModal = function () {
  historyModal.classList.add("hidden");
  overlay.classList.add("hidden");
};

const openCheckoutModal = function () {
  if (Object.keys(orders).length === 0) {
    alert("you have no pending order, Please click on 1 to make an order");
    return;
  }
  checkoutModal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

const closeCheckoutModal = function () {
  checkoutModal.classList.add("hidden");
  overlay.classList.add("hidden");
};

const openCurrentModal = function () {
  if (Object.keys(orders).length === 0) {
    alert("you have no current order, Please click on 1 to make an order");
    return;
  }
  currentModal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

const closeCurrentModal = function () {
  currentModal.classList.add("hidden");
  overlay.classList.add("hidden");
};

const openCancelModal = function () {
  if (Object.keys(orders).length === 0) {
    alert("you have no pending order, Please click on 1 to make an order");
    return;
  }
  cancelModal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

const closeCancelModal = function () {
  cancelModal.classList.add("hidden");
  overlay.classList.add("hidden");
};

btnsOpenItemsModal.addEventListener("click", openOrderModal);
btnsOpenCheckoutModal.addEventListener("click", openCheckoutModal);
btnsOpenHistoryModal.addEventListener("click", openHistoryModal);
btnsOpenCurrentModal.addEventListener("click", openCurrentModal);
btnsOpenCancelModal.addEventListener("click", openCancelModal);

btnCloseModal.addEventListener("click", closeModal);
btnCloseHistoryModal.addEventListener("click", closeHistoryModal);
btnCloseCheckoutModal.addEventListener("click", closeCheckoutModal);
btnCloseCurrentModal.addEventListener("click", closeCurrentModal);
btnCloseCancelModal.addEventListener("click", closeCancelModal);

overlay.addEventListener("click", closeModal);
overlay.addEventListener("click", closeHistoryModal);
overlay.addEventListener("click", closeCheckoutModal);
overlay.addEventListener("click", closeCurrentModal);
overlay.addEventListener("click", closeCancelModal);

document.addEventListener("keydown", function (e) {
  // console.log(e.key);

  if (e.key === "Escape" && !orderModal.classList.contains("hidden")) {
    closeModal();
  }
  if (e.key === "Escape" && !historyModal.classList.contains("hidden")) {
    closeHistoryModal();
  }
  if (e.key === "Escape" && !checkoutModal.classList.contains("hidden")) {
    closeCheckoutModal();
  }
  if (e.key === "Escape" && !currentModal.classList.contains("hidden")) {
    closeCurrentModal();
  }
  if (e.key === "Escape" && !cancelModal.classList.contains("hidden")) {
    closeCancelModal();
  }
});

// Receive restuarant menu from backend and display to frontend
socket.on("order", (data) => {
  const displayFoodMenu = function (items) {
    foodMenuItems.innerHTML = "";
    items.forEach((item, i) => {
      const html =
        `
          <div class="menu-items">
            <div>
              <div>${i + 1}</div>.` +
        " " +
        `  <div>${item}</div>
            </div>
          </div>`;
      foodMenuItems.insertAdjacentHTML("beforeend", html);
    });
  };
  displayFoodMenu(data);
  console.log(data);

  // place Order function
  placeOrder.addEventListener("click", function (e) {
    let inputValue = order_value.value;
    if (!inputValue) {
      alert(`Select an option from 1 to ${data.length}`);
      return;
    }
    let foodObj = { ...data };
    const inputOrder = foodObj[Number(inputValue) - 1];
    order_value.value = "";

    if (inputOrder === undefined) {
      alert(
        `This item is not available on the Menu; Please select option 1 to ${data.length}`
      );
      return;
    }

    // Send requested order to backend
    socket.emit("order_requested", {
      orderItem: inputOrder,
    });
  });
});

// Receive Order and display in checkout checkout 
socket.on("processing_order", (processed_data) => {
  const { message, order } = processed_data;
  alert(message);
  orderModal.classList.add("hidden");
  overlay.classList.add("hidden");
  orders.push(order);
  const checkoutTable = document.getElementById("checkout");
  const row = checkoutTable.insertRow(-1);
  let column1 = row.insertCell(0);
  let column2 = row.insertCell(1);
  let column3 = row.insertCell(2);
  let column4 = row.insertCell(3);

  column1.innerText = order.orderItem;
  column2.innerText = order.itemPrice;

  const checkoutId = `checkout_order_${order.orderItem}`;
  const cancelId = `cancel_order_${order.orderItem}`;

  column3.innerHTML = `
                <div>
                  <button id="${checkoutId}">Checkout </button>
                  <button id="${cancelId}">Cancel </button>
                </div>`;

  const checkoutBtn = document.getElementById(checkoutId);
  const cancelBtn = document.getElementById(cancelId);

  checkoutBtn.addEventListener("click", () => {
    document.querySelector(".status").style.display = "block";
    const confirmedOrder = {
      item: order.orderItem,
      price: order.itemPrice,
      status: "processed",
    };
    socket.emit("order_confirmed", {
      action: "confirmed order",
      confirmedOrder,
    });
    column3.innerHTML = `
                <div>
                  <button disabled id="${checkoutId}">Checkout </button>
                  <button disabled id="${cancelId}">Cancel </button>
                </div>`;
    column4.innerText = "Confirmed";
    alert(`Your Order of ${order.orderItem} is suceesfully confirmed`);
    checkoutModal.classList.add("hidden");
    overlay.classList.add("hidden");
  });

  cancelBtn.addEventListener("click", () => {
    document.querySelector(".status").style.display = "block";
    socket.emit("order_cancelled", order);
    column4.innerText = "Cancelled";
  });
});

// Receive order history from backend
socket.on("order_history", (data) => {
  console.log(data);
  var itemArr = [];
  var priceArr = [];
  for (var i = 0; i < data.length; i++) {
    itemArr.push(data[i].item);
  }
  for (var i = 0; i < data.length; i++) {
    priceArr.push(data[i].price);
  }
  historyItems.innerHTML = "";
  itemArr.forEach((item, i) => {
    const itemsHtml =
      `
              <div id="items" class="grid-container">
                <div><span>${i + 1}</span>.` +
      " " +
      `${item}</div>
              </div>
              `;
    historyItems.insertAdjacentHTML("beforeend", itemsHtml);
  });

  historyPrice.innerHTML = "";
  priceArr.forEach((price) => {
    const priceHtml = `
              <div id="items" class="grid-container">
                <div>${price}</div>
              </div>`;
    historyPrice.insertAdjacentHTML("beforeend", priceHtml);
  });
  console.log(itemArr);
  console.log(priceArr);
});

//Current order from Backend
socket.on("current_order", (data) => {
  currentItems.innerHTML = "";

  const currentItemsHtml = `
              <div id="items" class="grid-container">
                <div>${data.item}</div>
              </div>`;

  currentItems.insertAdjacentHTML("beforeend", currentItemsHtml);

  currentPrice.innerHTML = "";

  const currentPriceHtml = `
              <div id="items" class="grid-container">
                <div>${data.price}</div>
              </div>`;

  currentPrice.insertAdjacentHTML("beforeend", currentPriceHtml);
});

socket.on("processing_order", (processed_data) => {
  const { order } = processed_data;
  console.log(processed_data);
  const cancelTable = document.getElementById("cancel");
  const row = cancelTable.insertRow(-1);
  let column1 = row.insertCell(0);
  let column2 = row.insertCell(1);
  let column3 = row.insertCell(2);
  let column4 = row.insertCell(3);

  column1.innerText = order.orderItem;
  column2.innerText = order.itemPrice;

  const cancelOrder = `reject_order_${order.orderItem}`;

  column3.innerHTML = `
                <div>
                  <button id="${cancelOrder}">Cancel Order</button>
                </div>`;

  const cancelBtn = document.getElementById(cancelOrder);

  cancelBtn.addEventListener("click", () => {
    document.querySelector(".status").style.display = "block";
    socket.emit("order_cancelled", {order, message: `Your Order of ${order.orderItem} is suceesfully cancelled`});
    column3.innerHTML = `
                <div>
                  <button disabled id="${cancelOrder}">Cancel Order</button>
                </div>`;
    column4.innerText = "Cancelled";
    alert(`Your Order of ${order.orderItem} is suceesfully cancelled`);
    window.setTimeout(() => {
        location.assign('/');
      }, 1500);
  });
});
